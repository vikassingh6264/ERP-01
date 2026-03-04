from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
import gridfs
from bson import ObjectId

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

SECRET_KEY = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ============ AUTH MODELS ============
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    full_name: str
    role: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

# ============ INQUIRY MODELS ============
class InquiryCreate(BaseModel):
    customer_name: str
    company_name: str
    email: EmailStr
    country: str
    product_requested: str
    application: str
    sample_required: bool
    
class Inquiry(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_name: str
    company_name: str
    email: EmailStr
    country: str
    product_requested: str
    application: str
    sample_required: bool
    status: str = "New"
    created_by: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ============ SAMPLE MODELS ============
class SampleCreate(BaseModel):
    inquiry_id: str
    supplier_name: str
    product_name: str
    testing_required: bool

class Sample(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sample_id: str
    inquiry_id: str
    supplier_name: str
    product_name: str
    date_received: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    testing_required: bool
    assigned_technician: Optional[str] = None
    status: str = "Received"

# ============ LAB TEST MODELS ============
class ChemicalUsed(BaseModel):
    chemical_name: str
    quantity: float
    unit: str

class LabTestCreate(BaseModel):
    sample_id: str
    test_method: str
    chemicals_used: List[ChemicalUsed]
    test_result: str
    remarks: Optional[str] = None
    technician_name: str

class LabTest(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sample_id: str
    test_method: str
    chemicals_used: List[ChemicalUsed]
    test_result: str
    remarks: Optional[str] = None
    technician_name: str
    test_date: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    status: str = "Completed"

# ============ CHEMICAL INVENTORY MODELS ============
class ChemicalCreate(BaseModel):
    chemical_name: str
    stock_quantity: float
    unit: str
    minimum_stock_level: float
    supplier: str

class Chemical(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    chemical_name: str
    stock_quantity: float
    unit: str
    minimum_stock_level: float
    supplier: str
    last_updated: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ============ QUOTATION MODELS ============
class QuotationCreate(BaseModel):
    inquiry_id: str
    customer_name: str
    product: str
    price_per_kg: float
    quantity: float
    currency: str
    export_terms: str
    validity_days: int

class Quotation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    quotation_number: str
    inquiry_id: str
    customer_name: str
    product: str
    price_per_kg: float
    quantity: float
    currency: str
    export_terms: str
    validity_days: int
    total_amount: float
    status: str = "Sent"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ============ SALES ORDER MODELS ============
class SalesOrderCreate(BaseModel):
    quotation_id: str
    customer_name: str
    product: str
    quantity: float
    total_amount: float
    currency: str

class SalesOrder(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_number: str
    quotation_id: str
    customer_name: str
    product: str
    quantity: float
    total_amount: float
    currency: str
    status: str = "Confirmed"
    delivery_date: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ============ PURCHASE ORDER MODELS ============
class PurchaseOrderCreate(BaseModel):
    supplier: str
    product: str
    quantity: float
    unit_price: float
    currency: str

class PurchaseOrder(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    po_number: str
    supplier: str
    product: str
    quantity: float
    unit_price: float
    currency: str
    total_amount: float
    status: str = "Pending"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ============ SHIPMENT MODELS ============
class ShipmentCreate(BaseModel):
    sales_order_id: str
    container_number: str
    shipping_line: str
    port_of_loading: str
    destination_country: str
    bl_number: Optional[str] = None

class Shipment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    shipment_id: str
    sales_order_id: str
    container_number: str
    shipping_line: str
    port_of_loading: str
    destination_country: str
    bl_number: Optional[str] = None
    status: str = "In Transit"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ============ PAYMENT MODELS ============
class PaymentCreate(BaseModel):
    invoice_number: str
    customer: str
    currency: str
    amount: float
    bank_reference: Optional[str] = None
    firc_number: Optional[str] = None

class Payment(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    invoice_number: str
    customer: str
    currency: str
    amount: float
    payment_date: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    bank_reference: Optional[str] = None
    firc_number: Optional[str] = None
    status: str = "Received"

# ============ AUTH FUNCTIONS ============
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ============ AUTH ROUTES ============
@api_router.post("/auth/register", response_model=User)
async def register(user_data: UserCreate):
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        role=user_data.role
    )
    
    user_doc = user.model_dump()
    user_doc["hashed_password"] = hashed_password
    await db.users.insert_one(user_doc)
    
    return user

@api_router.post("/auth/login", response_model=Token)
async def login(credentials: UserLogin):
    user_doc = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user_doc or not verify_password(credentials.password, user_doc.get("hashed_password")):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = User(**{k: v for k, v in user_doc.items() if k != "hashed_password"})
    access_token = create_access_token(data={"sub": user.id})
    
    return Token(access_token=access_token, token_type="bearer", user=user)

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# ============ INQUIRY ROUTES ============
@api_router.post("/inquiries", response_model=Inquiry)
async def create_inquiry(inquiry_data: InquiryCreate, current_user: User = Depends(get_current_user)):
    inquiry = Inquiry(**inquiry_data.model_dump(), created_by=current_user.id)
    await db.inquiries.insert_one(inquiry.model_dump())
    return inquiry

@api_router.get("/inquiries", response_model=List[Inquiry])
async def get_inquiries(current_user: User = Depends(get_current_user)):
    inquiries = await db.inquiries.find({}, {"_id": 0}).to_list(1000)
    return inquiries

@api_router.get("/inquiries/{inquiry_id}", response_model=Inquiry)
async def get_inquiry(inquiry_id: str, current_user: User = Depends(get_current_user)):
    inquiry = await db.inquiries.find_one({"id": inquiry_id}, {"_id": 0})
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    return inquiry

@api_router.put("/inquiries/{inquiry_id}", response_model=Inquiry)
async def update_inquiry(inquiry_id: str, inquiry_data: InquiryCreate, current_user: User = Depends(get_current_user)):
    result = await db.inquiries.update_one(
        {"id": inquiry_id},
        {"$set": inquiry_data.model_dump()}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Inquiry not found")
    
    updated = await db.inquiries.find_one({"id": inquiry_id}, {"_id": 0})
    return updated

@api_router.put("/inquiries/{inquiry_id}/status")
async def update_inquiry_status(inquiry_id: str, status: str, current_user: User = Depends(get_current_user)):
    await db.inquiries.update_one({"id": inquiry_id}, {"$set": {"status": status}})
    return {"message": "Status updated"}

# ============ SAMPLE ROUTES ============
@api_router.post("/samples", response_model=Sample)
async def create_sample(sample_data: SampleCreate, current_user: User = Depends(get_current_user)):
    count = await db.samples.count_documents({}) + 1
    sample_id = f"SMP{count:05d}"
    sample = Sample(**sample_data.model_dump(), sample_id=sample_id)
    await db.samples.insert_one(sample.model_dump())
    return sample

@api_router.get("/samples", response_model=List[Sample])
async def get_samples(current_user: User = Depends(get_current_user)):
    samples = await db.samples.find({}, {"_id": 0}).to_list(1000)
    return samples

@api_router.get("/samples/{sample_id}", response_model=Sample)
async def get_sample(sample_id: str, current_user: User = Depends(get_current_user)):
    sample = await db.samples.find_one({"id": sample_id}, {"_id": 0})
    if not sample:
        raise HTTPException(status_code=404, detail="Sample not found")
    return sample

@api_router.put("/samples/{sample_id}/assign")
async def assign_technician(sample_id: str, technician_name: str, current_user: User = Depends(get_current_user)):
    await db.samples.update_one({"id": sample_id}, {"$set": {"assigned_technician": technician_name}})
    return {"message": "Technician assigned"}

# ============ LAB TEST ROUTES ============
@api_router.post("/lab-tests", response_model=LabTest)
async def create_lab_test(test_data: LabTestCreate, current_user: User = Depends(get_current_user)):
    lab_test = LabTest(**test_data.model_dump())
    
    for chemical in test_data.chemicals_used:
        chem = await db.chemicals.find_one({"chemical_name": chemical.chemical_name}, {"_id": 0})
        if chem:
            new_quantity = chem["stock_quantity"] - chemical.quantity
            await db.chemicals.update_one(
                {"id": chem["id"]},
                {"$set": {"stock_quantity": new_quantity, "last_updated": datetime.now(timezone.utc).isoformat()}}
            )
    
    await db.lab_tests.insert_one(lab_test.model_dump())
    await db.samples.update_one({"sample_id": test_data.sample_id}, {"$set": {"status": "Tested"}})
    
    return lab_test

@api_router.get("/lab-tests", response_model=List[LabTest])
async def get_lab_tests(current_user: User = Depends(get_current_user)):
    tests = await db.lab_tests.find({}, {"_id": 0}).to_list(1000)
    return tests

@api_router.get("/lab-tests/sample/{sample_id}", response_model=List[LabTest])
async def get_tests_by_sample(sample_id: str, current_user: User = Depends(get_current_user)):
    tests = await db.lab_tests.find({"sample_id": sample_id}, {"_id": 0}).to_list(1000)
    return tests

# ============ CHEMICAL INVENTORY ROUTES ============
@api_router.post("/chemicals", response_model=Chemical)
async def create_chemical(chemical_data: ChemicalCreate, current_user: User = Depends(get_current_user)):
    chemical = Chemical(**chemical_data.model_dump())
    await db.chemicals.insert_one(chemical.model_dump())
    return chemical

@api_router.get("/chemicals", response_model=List[Chemical])
async def get_chemicals(current_user: User = Depends(get_current_user)):
    chemicals = await db.chemicals.find({}, {"_id": 0}).to_list(1000)
    return chemicals

@api_router.put("/chemicals/{chemical_id}", response_model=Chemical)
async def update_chemical(chemical_id: str, chemical_data: ChemicalCreate, current_user: User = Depends(get_current_user)):
    result = await db.chemicals.update_one(
        {"id": chemical_id},
        {"$set": {**chemical_data.model_dump(), "last_updated": datetime.now(timezone.utc).isoformat()}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Chemical not found")
    
    updated = await db.chemicals.find_one({"id": chemical_id}, {"_id": 0})
    return updated

@api_router.get("/chemicals/low-stock")
async def get_low_stock_chemicals(current_user: User = Depends(get_current_user)):
    chemicals = await db.chemicals.find({}, {"_id": 0}).to_list(1000)
    low_stock = [c for c in chemicals if c["stock_quantity"] <= c["minimum_stock_level"]]
    return low_stock

# ============ QUOTATION ROUTES ============
@api_router.post("/quotations", response_model=Quotation)
async def create_quotation(quotation_data: QuotationCreate, current_user: User = Depends(get_current_user)):
    count = await db.quotations.count_documents({}) + 1
    quotation_number = f"QUO{count:05d}"
    total_amount = quotation_data.price_per_kg * quotation_data.quantity
    
    quotation = Quotation(
        **quotation_data.model_dump(),
        quotation_number=quotation_number,
        total_amount=total_amount
    )
    await db.quotations.insert_one(quotation.model_dump())
    await db.inquiries.update_one({"id": quotation_data.inquiry_id}, {"$set": {"status": "Quoted"}})
    return quotation

@api_router.get("/quotations", response_model=List[Quotation])
async def get_quotations(current_user: User = Depends(get_current_user)):
    quotations = await db.quotations.find({}, {"_id": 0}).to_list(1000)
    return quotations

@api_router.put("/quotations/{quotation_id}/status")
async def update_quotation_status(quotation_id: str, status: str, current_user: User = Depends(get_current_user)):
    await db.quotations.update_one({"id": quotation_id}, {"$set": {"status": status}})
    return {"message": "Status updated"}

# ============ SALES ORDER ROUTES ============
@api_router.post("/sales-orders", response_model=SalesOrder)
async def create_sales_order(order_data: SalesOrderCreate, current_user: User = Depends(get_current_user)):
    count = await db.sales_orders.count_documents({}) + 1
    order_number = f"SO{count:05d}"
    
    sales_order = SalesOrder(**order_data.model_dump(), order_number=order_number)
    await db.sales_orders.insert_one(sales_order.model_dump())
    await db.quotations.update_one({"id": order_data.quotation_id}, {"$set": {"status": "Accepted"}})
    return sales_order

@api_router.get("/sales-orders", response_model=List[SalesOrder])
async def get_sales_orders(current_user: User = Depends(get_current_user)):
    orders = await db.sales_orders.find({}, {"_id": 0}).to_list(1000)
    return orders

@api_router.put("/sales-orders/{order_id}/status")
async def update_order_status(order_id: str, status: str, current_user: User = Depends(get_current_user)):
    await db.sales_orders.update_one({"id": order_id}, {"$set": {"status": status}})
    return {"message": "Status updated"}

# ============ PURCHASE ORDER ROUTES ============
@api_router.post("/purchase-orders", response_model=PurchaseOrder)
async def create_purchase_order(po_data: PurchaseOrderCreate, current_user: User = Depends(get_current_user)):
    count = await db.purchase_orders.count_documents({}) + 1
    po_number = f"PO{count:05d}"
    total_amount = po_data.unit_price * po_data.quantity
    
    purchase_order = PurchaseOrder(**po_data.model_dump(), po_number=po_number, total_amount=total_amount)
    await db.purchase_orders.insert_one(purchase_order.model_dump())
    return purchase_order

@api_router.get("/purchase-orders", response_model=List[PurchaseOrder])
async def get_purchase_orders(current_user: User = Depends(get_current_user)):
    orders = await db.purchase_orders.find({}, {"_id": 0}).to_list(1000)
    return orders

# ============ SHIPMENT ROUTES ============
@api_router.post("/shipments", response_model=Shipment)
async def create_shipment(shipment_data: ShipmentCreate, current_user: User = Depends(get_current_user)):
    count = await db.shipments.count_documents({}) + 1
    shipment_id = f"SHP{count:05d}"
    
    shipment = Shipment(**shipment_data.model_dump(), shipment_id=shipment_id)
    await db.shipments.insert_one(shipment.model_dump())
    return shipment

@api_router.get("/shipments", response_model=List[Shipment])
async def get_shipments(current_user: User = Depends(get_current_user)):
    shipments = await db.shipments.find({}, {"_id": 0}).to_list(1000)
    return shipments

@api_router.put("/shipments/{shipment_id}/status")
async def update_shipment_status(shipment_id: str, status: str, current_user: User = Depends(get_current_user)):
    await db.shipments.update_one({"id": shipment_id}, {"$set": {"status": status}})
    return {"message": "Status updated"}

# ============ PAYMENT ROUTES ============
@api_router.post("/payments", response_model=Payment)
async def create_payment(payment_data: PaymentCreate, current_user: User = Depends(get_current_user)):
    payment = Payment(**payment_data.model_dump())
    await db.payments.insert_one(payment.model_dump())
    return payment

@api_router.get("/payments", response_model=List[Payment])
async def get_payments(current_user: User = Depends(get_current_user)):
    payments = await db.payments.find({}, {"_id": 0}).to_list(1000)
    return payments

# ============ DASHBOARD STATS ROUTES ============
@api_router.get("/stats/marketing")
async def get_marketing_stats(current_user: User = Depends(get_current_user)):
    total_inquiries = await db.inquiries.count_documents({})
    pending_quotes = await db.quotations.count_documents({"status": "Sent"})
    total_sales_orders = await db.sales_orders.count_documents({})
    
    all_orders = await db.sales_orders.find({}, {"_id": 0}).to_list(1000)
    total_revenue = sum(order["total_amount"] for order in all_orders)
    
    return {
        "total_inquiries": total_inquiries,
        "pending_quotes": pending_quotes,
        "sales_orders": total_sales_orders,
        "revenue": total_revenue
    }

@api_router.get("/stats/lab")
async def get_lab_stats(current_user: User = Depends(get_current_user)):
    pending_samples = await db.samples.count_documents({"status": "Received"})
    completed_tests = await db.lab_tests.count_documents({"status": "Completed"})
    
    chemicals = await db.chemicals.find({}, {"_id": 0}).to_list(1000)
    low_stock_count = sum(1 for c in chemicals if c["stock_quantity"] <= c["minimum_stock_level"])
    
    return {
        "pending_samples": pending_samples,
        "completed_tests": completed_tests,
        "low_stock_alerts": low_stock_count,
        "total_chemicals": len(chemicals)
    }

@api_router.get("/stats/logistics")
async def get_logistics_stats(current_user: User = Depends(get_current_user)):
    active_shipments = await db.shipments.count_documents({"status": "In Transit"})
    pending_orders = await db.sales_orders.count_documents({"status": "Confirmed"})
    
    return {
        "active_shipments": active_shipments,
        "pending_dispatches": pending_orders
    }

@api_router.get("/stats/admin")
async def get_admin_stats(current_user: User = Depends(get_current_user)):
    total_users = await db.users.count_documents({})
    total_inquiries = await db.inquiries.count_documents({})
    
    all_orders = await db.sales_orders.find({}, {"_id": 0}).to_list(1000)
    total_revenue = sum(order["total_amount"] for order in all_orders)
    
    return {
        "total_users": total_users,
        "total_inquiries": total_inquiries,
        "total_revenue": total_revenue
    }

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()