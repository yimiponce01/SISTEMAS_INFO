import { Menu, Moon, Sun, LogOut } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  pageTitle: string;
  userName?: string;
  userRole?: 'administrador' | 'operador';
  onLogout?: () => void;
}

export default function Header({
  sidebarOpen,
  setSidebarOpen,
  darkMode,
  setDarkMode,
  pageTitle,
  userName = 'Usuario',
  userRole = 'operador',
  onLogout
}: HeaderProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getRoleColor = () => {
    if (userRole === 'administrador') {
      return darkMode ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-purple-100 text-purple-700 border-purple-200';
    }
    return darkMode ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-blue-100 text-blue-700 border-blue-200';
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 ${darkMode ? 'bg-[#061326]/88 border-cyan-300/30' : 'bg-white/95 border-slate-200'} border-b h-16 transition-colors backdrop-blur-xl`}
      style={
        darkMode
          ? {
              boxShadow:
                '0 0 0 1px rgba(0,191,255,0.12), 0 0 28px rgba(0,191,255,0.18), 0 16px 48px rgba(2,6,23,0.45), inset 0 -1px 18px rgba(34,211,238,0.08)',
            }
          : undefined
      }
    >
      <div className="h-full px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 rounded-xl transition-all duration-300 ${darkMode ? 'border border-cyan-300/25 bg-cyan-300/5 shadow-lg shadow-cyan-400/10 hover:border-cyan-300/70 hover:bg-cyan-300/10 hover:shadow-cyan-400/30' : 'hover:bg-slate-100'}`}
          >
            <Menu className={`w-5 h-5 ${darkMode ? 'text-white' : 'text-slate-900'}`} />
          </button>
          <h1 className={`hidden text-lg font-light tracking-[0.18em] sm:block ${darkMode ? 'text-white drop-shadow-[0_0_12px_rgba(34,211,238,0.75)]' : 'text-slate-900'}`}>
            PONCEAGROSISTEM
          </h1>
        </div>

        <div className={`flex-1 truncate px-3 text-center text-base font-light tracking-[0.16em] sm:text-xl ${darkMode ? 'text-white drop-shadow-[0_0_14px_rgba(0,191,255,0.78)]' : 'text-slate-900'}`}>
          {pageTitle}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-xl transition-all duration-300 ${darkMode ? 'border border-amber-300/30 bg-amber-300/10 shadow-lg shadow-amber-400/10 hover:border-amber-300/70 hover:shadow-amber-400/30' : 'hover:bg-slate-100'}`}
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className={`flex items-center gap-3 ml-2 p-2 pr-4 rounded-lg transition-colors ${
                darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
              }`}
            >
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-white text-sm font-medium">{getInitials(userName)}</span>
              </div>
              <div className="text-left">
                <div className={`font-light text-sm ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {userName}
                </div>
                <div className={`text-xs px-2 py-0.5 rounded-full inline-block border ${getRoleColor()}`}>
                  {userRole === 'administrador' ? 'ADMINISTRADOR' : 'OPERADOR'}
                </div>
              </div>
            </button>

            {/* Profile Dropdown */}
            {showProfileMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowProfileMenu(false)}
                ></div>
                <div className={`absolute right-0 mt-2 w-64 rounded-xl shadow-2xl border z-50 overflow-hidden ${
                  darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                  <div className={`p-4 border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                    <div className={`font-light mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                      {userName}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full inline-block border ${getRoleColor()}`}>
                      {userRole === 'administrador' ? 'ADMINISTRADOR' : 'OPERADOR'}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onLogout?.();
                    }}
                    className={`w-full p-4 flex items-center gap-3 transition-colors ${
                      darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-light">Cerrar sesión</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
