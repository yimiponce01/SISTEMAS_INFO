import { Activity, Bell, Download, LayoutDashboard, Upload } from 'lucide-react';

interface SidebarProps {
  open: boolean;
  currentView: string;
  setCurrentView: (view: 'dashboard' | 'upload' | 'tracking' | 'settings' | 'alerts' | 'export') => void;
  setSidebarOpen: (open: boolean) => void;
  darkMode: boolean;
  userRole: 'administrador' | 'operador';
}

export default function Sidebar({
  open,
  currentView,
  setCurrentView,
  setSidebarOpen,
  darkMode,
  userRole,
}: SidebarProps) {
  const allMenuItems: {
    id: 'dashboard' | 'upload' | 'tracking' | 'alerts' | 'export';
    label: string;
    icon: any;
    roles: ('administrador' | 'operador')[];
  }[] = [
    { id: 'dashboard', label: 'Panel Principal', icon: LayoutDashboard, roles: ['administrador', 'operador'] },
    { id: 'upload', label: 'Añadir registros', icon: Upload, roles: ['administrador', 'operador'] },
    { id: 'tracking', label: 'Seguimiento', icon: Activity, roles: ['administrador'] },
    { id: 'export', label: 'Exportar reportes', icon: Download, roles: ['administrador'] },
    { id: 'alerts', label: 'Alertas inteligentes', icon: Bell, roles: ['administrador', 'operador'] },
  ];

  const menuItems = allMenuItems.filter((item) => item.roles.includes(userRole));

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed bottom-0 left-0 top-16 z-50 w-72 border-r shadow-2xl backdrop-blur-2xl transition-all duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } ${
          darkMode
            ? 'border-cyan-300/10 bg-slate-950/90'
            : 'border-slate-200/60 bg-white/85'
        }`}
      >
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setCurrentView(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/25'
                    : darkMode
                      ? 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                      : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-light">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
