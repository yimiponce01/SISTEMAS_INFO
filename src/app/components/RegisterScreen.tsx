import { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Shield, ArrowLeft } from 'lucide-react';

interface RegisterScreenProps {
  onRegister: (name: string, email: string, password: string, role: 'administrador' | 'operador') => void;
  onNavigateToLogin: () => void;
}

export default function RegisterScreen({ onRegister, onNavigateToLogin }: RegisterScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'administrador' | 'operador'>('operador');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }
    onRegister(name, email, password, role);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-64 h-64 bg-orange-500/10 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Register Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
          {/* Back Button */}
          <button
            onClick={onNavigateToLogin}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-6 transition-colors font-light"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al login
          </button>

          {/* Logo and Title */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white text-2xl font-light">CP</span>
            </div>
            <h1 className="text-3xl font-light text-slate-900 mb-2">Crear cuenta</h1>
            <p className="text-sm text-slate-600 font-light">Únete a Control Pecuario</p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-light text-slate-700 mb-2">
                Nombre completo
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Juan Pérez"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-light"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-sm font-light text-slate-700 mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-light"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-light text-slate-700 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-12 pr-12 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-light"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-sm font-light text-slate-700 mb-2">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full pl-12 pr-12 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-light"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Role Selector */}
            <div>
              <label className="block text-sm font-light text-slate-700 mb-2">
                Rol de usuario
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('operador')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    role === 'operador'
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-300 bg-white hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <User className={`w-5 h-5 ${role === 'operador' ? 'text-blue-600' : 'text-slate-600'}`} />
                    <span className={`font-light ${role === 'operador' ? 'text-blue-600' : 'text-slate-900'}`}>
                      Operador
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-light">Acceso limitado</p>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('administrador')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    role === 'administrador'
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-slate-300 bg-white hover:border-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className={`w-5 h-5 ${role === 'administrador' ? 'text-purple-600' : 'text-slate-600'}`} />
                    <span className={`font-light ${role === 'administrador' ? 'text-purple-600' : 'text-slate-900'}`}>
                      Admin
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-light">Acceso completo</p>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-light shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.98]"
            >
              Crear cuenta
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
