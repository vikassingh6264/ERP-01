import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

export const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('Marketing');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isLogin) {
      const result = await login(email, password);
      if (result.success) {
        toast.success('Login successful');
        navigate('/dashboard');
      } else {
        toast.error(result.error);
      }
    } else {
      const result = await register(email, password, fullName, role);
      if (result.success) {
        toast.success('Registration successful');
        navigate('/dashboard');
      } else {
        toast.error(result.error);
      }
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
              ChemExport ERP
            </h1>
            <p className="mt-3 text-lg text-slate-600">
              Laboratory & Export Management System
            </p>
          </div>

          <div className="mt-10">
            <div className="flex rounded-lg border border-slate-200 p-1 mb-6">
              <button
                data-testid="login-tab-button"
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                  isLogin
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Login
              </button>
              <button
                data-testid="register-tab-button"
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                  !isLogin
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6" data-testid="auth-form">
              {!isLogin && (
                <div>
                  <Label htmlFor="fullName" className="text-sm font-semibold text-slate-700">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    data-testid="fullname-input"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="mt-2 border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                    placeholder="Enter your full name"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                  Email Address
                </Label>
                <Input
                  id="email"
                  data-testid="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2 border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                  Password
                </Label>
                <Input
                  id="password"
                  data-testid="password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-2 border-slate-300 focus:border-teal-500 focus:ring-teal-500"
                  placeholder="Enter password"
                />
              </div>

              {!isLogin && (
                <div>
                  <Label htmlFor="role" className="text-sm font-semibold text-slate-700">
                    Role
                  </Label>
                  <select
                    id="role"
                    data-testid="role-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 focus:border-teal-500 focus:ring-teal-500 focus:outline-none"
                  >
                    <option value="Marketing">Marketing</option>
                    <option value="Lab">Laboratory</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              )}

              <Button
                type="submit"
                data-testid="submit-auth-button"
                className="w-full bg-slate-900 text-white hover:bg-slate-800 shadow-sm py-6 text-base font-medium transition-all"
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </Button>
            </form>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              &quot;Precision in every drop, integrity in every shipment.&quot;
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div
        className="hidden lg:block lg:w-1/2 bg-cover bg-center relative"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1580281845022-233f93de0671?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MjJ8MHwxfHNlYXJjaHwyfHxtb2Rlcm4lMjBjaGVtaWNhbCUyMGxhYm9yYXRvcnklMjBzY2llbnRpc3QlMjB3b3JraW5nfGVufDB8fHx8MTc3MjYyNjAyMXww&ixlib=rb-4.1.0&q=85)'
        }}
      >
        <div className="absolute inset-0 bg-slate-900/40" />
      </div>
    </div>
  );
};

export default Login;