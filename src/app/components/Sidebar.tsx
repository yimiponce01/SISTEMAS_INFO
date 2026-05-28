import { 
  Activity, 
  Bell, 
  Download, 
  LayoutDashboard, 
  Upload, 
  Settings, 
  FileText, 
  ClipboardList,
  BarChart3,
  Users,
  Package,
  TrendingUp
} from 'lucide-react';

interface SidebarProps {
  open: boolean;
  currentView: string;
  setCurrentView: (view: 'dashboard' | 'upload' | 'tracking' | 'settings' | 'alerts' | 'export') => void;
  setSidebarOpen: (open: boolean) => void;
  darkMode: boolean;
  userRole: 'administrador' | 'operador';
}

// ============================================================================
// MENÚ EXCLUSIVO PARA ADMINISTRADOR
// Acceso completo a todas las funcionalidades del sistema
// ============================================================================
const adminMenuItems = [
  // Sección Principal
  { 
    id: 'dashboard' as const, 
    label: 'Panel Principal', 
    icon: LayoutDashboard,
    description: 'Vista general del sistema',
    category: 'principal'
  },
  
  // Sección de Gestión
  { 
    id: 'upload' as const, 
    label: 'Añadir Registros', 
    icon: Upload,
    description: 'Carga masiva de datos',
    category: 'gestion'
  },
  { 
    id: 'tracking' as const, 
    label: 'Seguimiento', 
    icon: Activity,
    description: 'Monitor de actividad en tiempo real',
    category: 'gestion'
  },
  
  // Sección de Reportes
  { 
    id: 'export' as const, 
    label: 'Exportar Reportes', 
    icon: Download,
    description: 'Generación de informes',
    category: 'reportes'
  },
  { 
    id: 'alerts' as const, 
    label: 'Alertas Inteligentes', 
    icon: Bell,
    description: 'Notificaciones del sistema',
    category: 'reportes'
  },
  
  // Sección de Configuración
  { 
    id: 'settings' as const, 
    label: 'Configuración', 
    icon: Settings,
    description: 'Ajustes del sistema',
    category: 'configuracion'
  },
];

// ============================================================================
// MENÚ EXCLUSIVO PARA OPERADOR
// Acceso limitado a funcionalidades operativas básicas
// ============================================================================
const operatorMenuItems = [
  // Sección Principal
  { 
    id: 'dashboard' as const, 
    label: 'Panel Principal', 
    icon: LayoutDashboard,
    description: 'Vista general del sistema',
    category: 'principal'
  },
  
  // Sección de Gestión
  { 
    id: 'upload' as const, 
    label: 'Añadir Registros', 
    icon: Upload,
    description: 'Carga de nuevos datos',
    category: 'gestion'
  },
  
  // Sección de Monitoreo
  { 
    id: 'alerts' as const, 
    label: 'Alertas Inteligentes', 
    icon: Bell,
    description: 'Notificaciones del sistema',
    category: 'monitoreo'
  },
];

// Definición de categorías para agrupación visual
const categoryLabels = {
  principal: 'Principal',
  gestion: 'Gestión',
  reportes: 'Reportes',
  monitoreo: 'Monitoreo',
  configuracion: 'Configuración',
};

export default function Sidebar({
  open,
  currentView,
  setCurrentView,
  setSidebarOpen,
  darkMode,
  userRole,
}: SidebarProps) {
  // Seleccionar menú según el rol del usuario
  const menuItems = userRole === 'administrador' ? adminMenuItems : operatorMenuItems;

  // Agrupar elementos por categoría
  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof menuItems>);

  // Mantener orden de categorías
  const categoryOrder = ['principal', 'gestion', 'reportes', 'monitoreo', 'configuracion'];

  return (
    <>
      {/* Overlay para móvil */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar principal */}
      <aside
        className={`fixed bottom-0 left-0 top-16 z-50 w-72 border-r shadow-2xl backdrop-blur-2xl transition-all duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } ${
          darkMode
            ? 'border-cyan-300/10 bg-slate-950/90'
            : 'border-slate-200/60 bg-white/85'
        }`}
      >
        {/* Header del sidebar */}
        <div className={`px-4 py-4 border-b ${darkMode ? 'border-cyan-300/10' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              darkMode 
                ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30' 
                : 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200'
            }`}>
              <span className={`text-sm font-light ${darkMode ? 'text-cyan-400' : 'text-blue-600'}`}>
                {userRole === 'administrador' ? 'AD' : 'OP'}
              </span>
            </div>
            <div>
              <p className={`text-sm font-light ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                {userRole === 'administrador' ? 'Administrador' : 'Operador'}
              </p>
              <p className={`text-xs ${darkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                {userRole === 'administrador' ? 'Acceso completo' : 'Acceso limitado'}
              </p>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="p-3 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)]">
          {categoryOrder.map((category) => {
            const items = groupedItems[category];
            if (!items || items.length === 0) return null;

            return (
              <div key={category}>
                {/* Título de categoría */}
                <div className={`px-3 mb-2 text-xs uppercase tracking-wider ${
                  darkMode ? 'text-slate-600' : 'text-slate-400'
                }`}>
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </div>

                {/* Items de la categoría */}
                <div className="space-y-1">
                  {items.map((item) => {
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
                        className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300 hover:-translate-y-0.5 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-500 to-violet-600 text-white shadow-lg shadow-blue-500/25'
                            : darkMode
                              ? 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                              : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          isActive
                            ? 'bg-white/20'
                            : darkMode
                              ? 'bg-white/[0.04] group-hover:bg-white/[0.08]'
                              : 'bg-slate-100 group-hover:bg-slate-200'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-light">{item.label}</p>
                        </div>
                        {isActive && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer del sidebar */}
        <div className={`absolute bottom-0 left-0 right-0 p-3 border-t ${
          darkMode ? 'border-cyan-300/10 bg-slate-950/90' : 'border-slate-200 bg-white/95'
        }`}>
          <div className={`text-xs text-center ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>
            PONCEAGROSISTEM v1.0
          </div>
        </div>
      </aside>
    </>
  );
}