import { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

interface ForgotPasswordScreenProps {
  onSendRecovery: (email: string) => void;
  onNavigateToLogin: () => void;
}

export default function ForgotPasswordScreen({ onSendRecovery, onNavigateToLogin }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSendRecovery(email);
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-64 h-64 bg-orange-500/10 rounded-full blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Recovery Card */}
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

          {!sent ? (
            <>
              {/* Logo and Title */}
              <div className="text-center mb-8">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <span className="text-white text-2xl font-light">CP</span>
                </div>
                <h1 className="text-3xl font-light text-slate-900 mb-2">Recuperar contraseña</h1>
                <p className="text-sm text-slate-600 font-light">
                  Te enviaremos instrucciones a tu correo
                </p>
              </div>

              {/* Recovery Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
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

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-light shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all hover:-translate-y-0.5"
                >
                  Enviar instrucciones
                </button>
              </form>
            </>
          ) : (
            <>
              {/* Success Message */}
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-light text-slate-900 mb-3">¡Correo enviado!</h2>
                <p className="text-sm text-slate-600 font-light mb-6">
                  Hemos enviado las instrucciones de recuperación a <strong>{email}</strong>
                </p>
                <button
                  onClick={onNavigateToLogin}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-light shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all hover:-translate-y-0.5"
                >
                  Volver al login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
