// src/lib/mockApi.js

// Initialize the local storage database
const initDb = () => {
    if (!localStorage.getItem('mock_db')) {
        const initialDb = {
            users: [
                {
                    id: 'u1',
                    email: 'admin@kolorjet.example',
                    password: 'password123',
                    full_name: 'Admin User',
                    role: 'Admin',
                },
                {
                    id: 'u2',
                    email: 'marketing@kolorjet.example',
                    password: 'password123',
                    full_name: 'Marketing Rep',
                    role: 'Marketing',
                },
                {
                    id: 'u3',
                    email: 'lab@kolorjet.example',
                    password: 'password123',
                    full_name: 'Lab Tech',
                    role: 'Lab',
                },
                {
                    id: 'u4',
                    email: 'logistics@kolorjet.example',
                    password: 'password123',
                    full_name: 'Logistics Manager',
                    role: 'Logistics',
                }
            ],
            samples: [],
            inquiries: [],
            chemicals: [],
            lab_tests: [],
            quotations: [],
            sales_orders: [],
            purchase_orders: [],
            shipments: [],
            payments: [],
            invoices: [],
        };
        localStorage.setItem('mock_db', JSON.stringify(initialDb));
    }
};

export const getDb = () => {
    initDb();
    return JSON.parse(localStorage.getItem('mock_db'));
};

export const saveDb = (db) => {
    localStorage.setItem('mock_db', JSON.stringify(db));
};

export const mockLogin = (email, password) => {
    const db = getDb();
    const user = db.users.find((u) => u.email === email && u.password === password);
    if (user) {
        const { password: _, ...userData } = user;
        return {
            access_token: `mock_token_${user.id}_${Date.now()}`,
            user: userData,
        };
    }
    throw new Error('Invalid credentials');
};

export const mockRegister = (email, password, full_name, role) => {
    const db = getDb();
    if (db.users.find((u) => u.email === email)) {
        throw new Error('Email already registered');
    }
    const newUser = {
        id: `u${Date.now()}`,
        email,
        password,
        full_name,
        role,
    };
    db.users.push(newUser);
    saveDb(db);
    return mockLogin(email, password);
};

export const mockFetchUser = (token) => {
    if (!token || !token.startsWith('mock_token_')) {
        throw new Error('Invalid token');
    }
    const userId = token.split('_')[2];
    const db = getDb();
    const user = db.users.find((u) => u.id === userId);
    if (user) {
        const { password: _, ...userData } = user;
        return userData;
    }
    throw new Error('User not found');
};

// Generic CRUD Mock HTTP adapter logic
export const mockHttpAdapter = (method, url, data) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const db = getDb();
            const urlNoQuery = url.split('?')[0];
            let pathContent = urlNoQuery.replace(/^[/#_A-Za-z0-9]*\/api/, ''); // Remove base API part if present
            if (pathContent.startsWith('/')) pathContent = pathContent.slice(1);

            const segments = pathContent.split('/').filter(Boolean);
            const resource = segments[0] || 'unknown'; // inquiries, samples, etc.
            const id = segments[1];

            try {
                // Determine update data early for PUT/POST
                let updateData = { ...(data || {}) };

                // If query string exists, parse it for potential status/params
                if (url.includes('?')) {
                    const queryString = url.split('?')[1];
                    const params = new URLSearchParams(queryString);
                    params.forEach((value, key) => {
                        updateData[key] = value;
                    });
                }

                // Journey / activities logic
                if (resource === 'activities' && segments[1] === 'customer') {
                    const customerEmail = segments[2];
                    const acts = [];

                    const inquiry = db.inquiries.find(i => i.email === customerEmail);
                    if (inquiry) {
                        acts.push({
                            type: 'inquiry',
                            status: inquiry.status || 'New',
                            date: inquiry.created_at,
                            title: 'Customer Inquiry Created',
                            description: `Product: ${inquiry.product_requested}`,
                            data: inquiry
                        });

                        // Samples for this inquiry
                        const samples = db.samples.filter(s => s.inquiry_id === inquiry.id);
                        samples.forEach(sample => {
                            acts.push({
                                type: 'sample',
                                status: sample.status || 'Received',
                                date: sample.date_received || sample.created_at,
                                title: `Sample Received - ${sample.sample_id}`,
                                description: `Product: ${sample.product_name}`,
                                data: sample
                            });

                            // Tests for this sample
                            const tests = db.lab_tests.filter(t => t.sample_id === sample.sample_id);
                            tests.forEach(test => {
                                acts.push({
                                    type: 'test',
                                    status: test.status || 'Completed',
                                    date: test.test_date || test.created_at,
                                    title: 'Lab Test Completed',
                                    description: `Method: ${test.test_method}`,
                                    data: test
                                });
                            });
                        });

                        // Quotations for this inquiry
                        const quotes = db.quotations.filter(q => q.inquiry_id === inquiry.id);
                        quotes.forEach(quote => {
                            acts.push({
                                type: 'quotation',
                                status: quote.status || 'Sent',
                                date: quote.created_at,
                                title: `Quotation Sent - ${quote.quotation_number}`,
                                description: `Amount: ${quote.currency} ${quote.total_amount}`,
                                data: quote
                            });
                        });
                    }

                    acts.sort((a, b) => new Date(b.date) - new Date(a.date));

                    const getStage = (activities) => {
                        if (activities.length === 0) return 'No Activity';
                        const stageMap = {
                            inquiry: 'Inquiry',
                            sample: 'Sample Testing',
                            test: 'Lab Testing',
                            quotation: 'Quotation',
                            sales_order: 'Order Confirmed',
                            shipment: 'In Transit',
                            payment: 'Completed'
                        };
                        return stageMap[activities[0].type] || 'Inquiry';
                    };

                    resolve({
                        status: 200,
                        data: {
                            activities: acts,
                            current_stage: getStage(acts)
                        }
                    });
                    return;
                }

                if (resource === 'stats') {
                    // Special logic for Dashboard stats
                    resolve({
                        status: 200,
                        data: {
                            total_inquiries: db.inquiries.length,
                            pending_quotes: db.quotations.filter(q => q.status === 'Pending').length,
                            sales_orders: db.sales_orders.length,
                            revenue: 145000,
                            pending_samples: db.samples.filter(s => s.status === 'Pending').length,
                            completed_tests: db.lab_tests.filter(t => t.status === 'Completed').length,
                            low_stock_alerts: 2,
                            total_chemicals: db.chemicals.length,
                            active_shipments: db.shipments.filter(s => s.status !== 'Delivered').length,
                            pending_dispatches: db.sales_orders.filter(so => so.status === 'Pending').length,
                            total_users: db.users.length,
                            total_revenue: 350000
                        }
                    });
                    return;
                }

                const table = db[resource.replace('-', '_')]; // e.g. lab-tests -> lab_tests

                if (!table) {
                    resolve({ status: 200, data: [] }); // return empty array safely for unknown resources
                    return;
                }

                switch (method.toLowerCase()) {
                    case 'get':
                        if (id) {
                            const item = table.find(item => item.id === id);
                            if (item) resolve({ status: 200, data: item });
                            else reject({ response: { status: 404, data: { detail: 'Not found' } } });
                        } else {
                            resolve({ status: 200, data: table });
                        }
                        break;

                    case 'post':
                        const newItem = {
                            id: `${resource}_${Date.now()}`,
                            created_at: new Date().toISOString(),
                            status: resource === 'inquiries' ? 'New' : (resource === 'quotations' ? 'Sent' : undefined),
                            ...data,
                        };
                        table.push(newItem);

                        // AUTOMATION: Update Inquiry status based on actions
                        if (resource === 'quotations' && data.inquiry_id) {
                            const inquiryIndex = db.inquiries.findIndex(i => i.id === data.inquiry_id);
                            if (inquiryIndex !== -1) {
                                db.inquiries[inquiryIndex].status = 'Quoted';
                                db.inquiries[inquiryIndex].updated_at = new Date().toISOString();
                            }
                        } else if (resource === 'samples' && data.inquiry_id) {
                            const inquiryIndex = db.inquiries.findIndex(i => i.id === data.inquiry_id);
                            if (inquiryIndex !== -1) {
                                db.inquiries[inquiryIndex].status = 'Sample Testing';
                                db.inquiries[inquiryIndex].updated_at = new Date().toISOString();
                            }
                        } else if (resource === 'lab_tests' && data.sample_id) {
                            // Find sample to find inquiry
                            const sample = db.samples.find(s => s.sample_id === data.sample_id);
                            if (sample && sample.inquiry_id) {
                                const inquiryIndex = db.inquiries.findIndex(i => i.id === sample.inquiry_id);
                                if (inquiryIndex !== -1) {
                                    db.inquiries[inquiryIndex].status = 'Lab Testing';
                                    db.inquiries[inquiryIndex].updated_at = new Date().toISOString();
                                }
                            }
                        } else if (resource === 'sales_orders' && data.inquiry_id) {
                            const inquiryIndex = db.inquiries.findIndex(i => i.id === data.inquiry_id);
                            if (inquiryIndex !== -1) {
                                db.inquiries[inquiryIndex].status = 'Order Confirmed';
                                db.inquiries[inquiryIndex].updated_at = new Date().toISOString();
                            }
                        } else if (resource === 'shipments' && data.inquiry_id) {
                            const inquiryIndex = db.inquiries.findIndex(i => i.id === data.inquiry_id);
                            if (inquiryIndex !== -1) {
                                db.inquiries[inquiryIndex].status = 'In Transit';
                                db.inquiries[inquiryIndex].updated_at = new Date().toISOString();
                            }
                        } else if (resource === 'payments' && data.inquiry_id) {
                            const inquiryIndex = db.inquiries.findIndex(i => i.id === data.inquiry_id);
                            if (inquiryIndex !== -1) {
                                db.inquiries[inquiryIndex].status = 'Completed';
                                db.inquiries[inquiryIndex].updated_at = new Date().toISOString();
                            }
                        }

                        saveDb(db);
                        resolve({ status: 201, data: newItem });
                        break;

                    case 'put':
                        if (!id) throw new Error('ID required for PUT');
                        const index = table.findIndex(item => item.id === id);
                        if (index !== -1) {
                            table[index] = { ...table[index], ...updateData, updated_at: new Date().toISOString() };
                            saveDb(db);
                            resolve({ status: 200, data: table[index] });
                        } else {
                            reject({ response: { status: 404, data: { detail: 'Not found' } } });
                        }
                        break;

                    case 'delete':
                        if (!id) throw new Error('ID required for DELETE');
                        const dIndex = table.findIndex(item => item.id === id);
                        if (dIndex !== -1) {
                            table.splice(dIndex, 1);
                            saveDb(db);
                            resolve({ status: 200, data: { success: true } });
                        } else {
                            reject({ response: { status: 404, data: { detail: 'Not found' } } });
                        }
                        break;

                    default:
                        throw new Error('Method not supported in mock adapter');
                }
            } catch (err) {
                reject({ response: { status: 500, data: { detail: err.message } } });
            }
        }, 0); // No delay for better performance
    });
};
