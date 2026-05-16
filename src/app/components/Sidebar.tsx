import { LayoutDashboard, Upload, Activity, Settings, Bell, Download } from 'lucide-react';

interface SidebarProps {
  open: boolean;
  currentView: string;
  setCurrentView: (view: 'dashboard' | 'upload' | 'tracking' | 'settings' | 'alerts' | 'export') => void;
  darkMode: boolean;
  userRole?: 'administrador' | 'operador';
}

export default function Sidebar({ open, currentView, setCurrentView, darkMode, userRole = 'operador' }: SidebarProps) {
  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['administrador', 'operador'] },
    { id: 'upload', label: 'Añadir registros', icon: Upload, roles: ['administrador', 'operador'] },
    { id: 'tracking', label: 'Seguimiento', icon: Activity, roles: ['administrador'] },
    { id: 'export', label: 'Exportar reportes', icon: Download, roles: ['administrador'] },
    { id: 'alerts', label: 'Alertas inteligentes', icon: Bell, roles: ['administrador', 'operador'] },
  ] as const;

  const menuItems = allMenuItems.filter(item => item.roles.includes(userRole));

  return (
    <>
      {/* Overlay backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setCurrentView(currentView as any)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-16 bottom-0 w-64 z-50 transition-all duration-300 ${
        open ? 'translate-x-0' : '-translate-x-full'
      } ${darkMode ? 'bg-slate-900/95 border-slate-700' : 'bg-white/95 border-slate-200'} border-r backdrop-blur-xl shadow-2xl`}>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? darkMode
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30'
                    : darkMode
                      ? 'text-slate-300 hover:bg-slate-800'
                      : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-light">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
          <div className={`text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            v1.0.0 - Premium Edition
          </div>
        </div>
      </aside>
    </>
  );
}
