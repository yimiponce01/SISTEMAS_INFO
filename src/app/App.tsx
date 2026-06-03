import Header from './components/Header';
import Sidebar from './components/Sidebar';
import FilterBar from './components/FilterBar';
import KPICards from './components/KPICards';
import ChartsSection from './components/ChartsSection';
import FinanceCharts from './components/FinanceCharts';
import SmartAlertsPanel from './components/SmartAlertsPanel';
import FinancialAlertsPanel from './components/FinancialAlertsPanel';
import UploadModule from './components/UploadModule';
import ActivityTracking from './components/ActivityTracking';
import ExportReports from './components/ExportReports';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import ForgotPasswordScreen from './components/ForgotPasswordScreen';
import Toast, { type ToastType } from './components/Toast';
import { useEffect, useState, useRef } from 'react';
import { supabase } from './lib/supabase';
import { fetchDashboardData, type DashboardData } from './lib/dashboardData';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';

type AuthScreen = 'login' | 'register' | 'forgot';
type DashboardView = 'dashboard' | 'upload' | 'tracking' | 'settings' | 'alerts' | 'export';
type DashboardArea = 'produccion' | 'finanzas';
type AnimalFilter = 'bovinos' | 'gallinas' | 'ambos';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>('success');

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<DashboardView>('dashboard');
  const [darkMode, setDarkMode] = useState(true);
  const [selectedArea, setSelectedArea] = useState<DashboardArea>('produccion');
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalFilter>('bovinos');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  

  
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const [dateRange, setDateRange] = useState({
    from: firstDay.toISOString().split('T')[0],
    to: today.toISOString().split('T')[0],
  });

  

  const openDashboardDefaults = () => {
    setCurrentView('dashboard');
    setSelectedArea('produccion');
    setSelectedAnimal('bovinos');
  };

  const pushToast = (message: string, type: ToastType = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  const getLoginErrorMessage = (message: string) => {
    const normalized = message.toLowerCase();

    if (normalized.includes('invalid login')) return 'Correo o contraseña incorrecta';
    if (normalized.includes('email')) return 'Correo incorrecto';
    if (normalized.includes('password') || normalized.includes('contraseña')) return 'Contraseña incorrecta';

    return 'No se pudo iniciar sesión. Verifica tus datos.';
  };

  const hydrateUser = async (email?: string | null) => {
    const cleanEmail = (email || '').trim().toLowerCase();

    // Consultar ÚNICAMENTE la tabla real `usuarios`
    const { data: usuarioDB, error: usuarioError } = await supabase
      .from('usuarios')
      .select('id_usuario, nombre, email, rol')
      .eq('email', cleanEmail)
      .single();

    if (usuarioError || !usuarioDB) {
      pushToast('Usuario no encontrado en el sistema', 'error');
      return false;
    }

    // Validar que el rol sea válido
    const userRole = usuarioDB.rol?.toLowerCase();
    if (!userRole || (userRole !== 'administrador' && userRole !== 'operador')) {
      pushToast('Rol de usuario inválido. Contacte al administrador.', 'error');
      return false;
    }

    setCurrentUser({
      id: usuarioDB.id_usuario,
      name: usuarioDB.nombre,
      email: usuarioDB.email,
      role: userRole,
    });

    setIsAuthenticated(true);
    openDashboardDefaults();
    return true;
  };

  const handleLogin = async (
    email: string,
    password: string,
    rememberMe: boolean
  ) => {
    void rememberMe;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (error) {
      pushToast(getLoginErrorMessage(error.message), 'error');
      return;
    }

    const hydrated = await hydrateUser(data.user.email);

    if (hydrated) {
      pushToast('Bienvenido a PONCEAGROSISTEM', 'success');
    }
  };

  const handleRegister = async (
    name: string,
    email: string,
    password: string,
    role: 'administrador' | 'operador'
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (error) {
      pushToast(error.message, 'error');
      return;
    }

    setCurrentUser({
      name,
      email,
      role,
    });

    setIsAuthenticated(true);
    openDashboardDefaults();
    pushToast('Cuenta creada', 'success');
  };

  const handleForgotPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    pushToast(
      error ? error.message : 'Correo de recuperación enviado',
      error ? 'error' : 'success'
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();

    setCurrentUser(null);
    setIsAuthenticated(false);
    setAuthScreen('login');
    openDashboardDefaults();
  };

  const getPageTitle = () => {
    if (currentView === 'upload') return 'Añadir Registros';
    if (currentView === 'tracking') return 'Seguimiento';
    if (currentView === 'settings') return 'Configuración';
    if (currentView === 'alerts') return 'Alertas Inteligentes';
    if (currentView === 'export') return 'Exportar Reportes';
    return 'PONCEAGROSISTEM';
  };

  const dashboardSubtitle =
    selectedArea === 'produccion'
      ? 'Área de Producción'
      : 'Área Financiera';

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        await hydrateUser(session.user.email);
      }
    };

    getSession();
  }, []);

  
  // Referencia al contenedor principal de tu contenido
const componentRef = useRef<HTMLDivElement>(null);



  const generateDashboardPDF = async () => {

  if (!componentRef.current) return;

  const originalTransform =
    componentRef.current.style.transform;

  // QUITAR transformaciones temporales
  componentRef.current.style.transform = 'none';

  const dataUrl = await toPng(
  componentRef.current,
  {
    cacheBust: true,
    pixelRatio: 3,
    backgroundColor: '#061326'
  }
);

  const pdf = new jsPDF("p", "mm", "a4");

  const img = new Image();

  img.src = dataUrl;

  await new Promise((resolve) => {
    img.onload = resolve;
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();

  const pageHeight = pdf.internal.pageSize.getHeight();

  const margin = 0.5;

  const imgWidth = pdfWidth - (margin * 2);

  const imgHeight =
    (img.height * imgWidth) /
    img.width;

  let heightLeft = imgHeight;

  let position = 0;

  pdf.addImage(
    dataUrl,
    "PNG",
    margin,
    position + margin,
    imgWidth,
    imgHeight
  );

  heightLeft -= pageHeight;

  while (heightLeft > 0) {

    position = heightLeft - imgHeight;

    pdf.addPage();

    pdf.addImage(
      dataUrl,
      "PNG",
      margin,
      position + margin,
      imgWidth,
      imgHeight
    );

    heightLeft -= pageHeight;
  }

  pdf.save("Dashboard_PonceAgro.pdf");
  // RESTAURAR configuración original
  componentRef.current.style.transform =
    originalTransform;
};

const handleDownloadDashboardPDF = async () => {

  try {

    setIsGeneratingPDF(true);

    setCurrentView('dashboard');

    setTimeout(async () => {

      await generateDashboardPDF();

      setCurrentView('export');

      setIsGeneratingPDF(false);

      pushToast(
        'Dashboard exportado correctamente',
        'success'
      );

    }, 1500);

  } catch (error) {

    console.error(error);

    setIsGeneratingPDF(false);

    pushToast(
      'Error al exportar',
      'error'
    );

  }
};

  useEffect(() => {
    if (!isAuthenticated) return;

    const loadDashboardData = async () => {
      setDashboardLoading(true);
      const data = await fetchDashboardData(selectedAnimal, dateRange);
      setDashboardData(data);
      setDashboardLoading(false);
    };

    loadDashboardData();
  }, [isAuthenticated, selectedAnimal, dateRange]);

  if (!isAuthenticated) {
    if (authScreen === 'register') {
      return (
        <RegisterScreen
          onRegister={handleRegister}
          onNavigateToLogin={() => setAuthScreen('login')}
        />
      );
    }

    if (authScreen === 'forgot') {
      return (
        <ForgotPasswordScreen
          onSendRecovery={handleForgotPassword}
          onNavigateToLogin={() => setAuthScreen('login')}
        />
      );
    }

    return (
      <>
        <Toast
          message={toastMessage}
          show={showToast}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
        <LoginScreen
          onLogin={handleLogin}
          onNavigateToRegister={() => setAuthScreen('register')}
          onNavigateToForgot={() => setAuthScreen('forgot')}
        />
      </>
    );
  }

  return (
    <div
      className={`min-h-screen ${darkMode ? 'bg-[#061326]' : 'bg-gradient-to-br from-slate-100 via-slate-50 to-blue-50/30'}`}
      style={
        darkMode
          ? {
              background:
                'radial-gradient(circle at 18% 8%, rgba(0,191,255,0.18), transparent 28%), radial-gradient(circle at 85% 12%, rgba(192,38,255,0.16), transparent 30%), linear-gradient(135deg, #061326 0%, #08172C 48%, #050B18 100%)',
            }
          : undefined
      }
    >
      <Toast
        message={toastMessage}
        show={showToast}
        type={toastType}
        onClose={() => setShowToast(false)}
      />

      <Header
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        pageTitle={getPageTitle()}
        userName={currentUser?.name}
        userRole={currentUser?.role}
        onLogout={handleLogout}
      />

      <Sidebar
        open={sidebarOpen}
        currentView={currentView}
        setCurrentView={setCurrentView}
        setSidebarOpen={setSidebarOpen}
        darkMode={darkMode}
        userRole={currentUser?.role}
      />

      <main className="pt-16">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {currentView === 'dashboard' && (
            <div ref={componentRef} id="dashboard-printable-area">
            <>
              <div className="mb-6">
                <p
                  className={`text-xs uppercase tracking-[0.35em] ${
                    darkMode
                      ? 'text-cyan-300/80'
                      : 'text-cyan-700'
                  }`}
                >
                  Centro de Control
                </p>
                <h2 className={`mt-2 text-3xl font-light ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                  {dashboardSubtitle}
                </h2>
              </div>

              <FilterBar
                selectedArea={selectedArea}
                setSelectedArea={setSelectedArea}
                selectedAnimal={selectedAnimal}
                setSelectedAnimal={setSelectedAnimal}
                dateRange={dateRange}
                setDateRange={setDateRange}
                darkMode={darkMode}
              />

              <KPICards
                selectedLivestock={selectedAnimal}
                selectedArea={selectedArea}
                dateRange={dateRange}
                darkMode={darkMode}
                dashboardData={dashboardData}
                loading={dashboardLoading}
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">                  
                    {selectedArea === 'finanzas' ? (
                    <FinanceCharts
                      selectedLivestock={selectedAnimal}
                      dateRange={dateRange}
                      darkMode={darkMode}
                      dashboardData={dashboardData}
                    />
                  ) : (
                    <ChartsSection
                      selectedLivestock={selectedAnimal}
                      dateRange={dateRange}
                      darkMode={darkMode}
                      dashboardData={dashboardData}
                    />
                  )}
                </div>

                <div className="lg:col-span-1">
                {selectedArea === 'produccion' ? (
                  <SmartAlertsPanel
                    selectedLivestock={selectedAnimal === 'ambos' ? 'both' : selectedAnimal}
                    darkMode={darkMode}
                    dashboardData={dashboardData}
                    selectedArea="produccion"
                  />
                ) : (
                  <FinancialAlertsPanel
                    darkMode={darkMode}
                    dashboardData={dashboardData}
                  />
                )}
              </div>
              </div>
            </>
            </div>
          )}

          {currentView === 'upload' && (
            <UploadModule darkMode={darkMode} />
          )}

          {currentView === 'tracking' && (
            <ActivityTracking darkMode={darkMode} />
          )}

          {currentView === 'export' && (
            <ExportReports
              darkMode={darkMode} 
              isGenerating={isGeneratingPDF} 
              onCustomDownload={handleDownloadDashboardPDF} 
              
            />
          )}

          {currentView === 'alerts' && (
            <div className={`${darkMode ? 'bg-slate-900/70 text-white border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-8`}>
              <h2 className="text-2xl font-light mb-4">Alertas Inteligentes</h2>
              <SmartAlertsPanel
                selectedLivestock="both"
                darkMode={darkMode}
                fullScreen
                dashboardData={dashboardData}
              />
            </div>
          )}

          {currentView === 'settings' && (
            <div className={`${darkMode ? 'bg-slate-900/70 text-white border-slate-700' : 'bg-white border-slate-200'} rounded-xl border p-8`}>
              <h2 className="text-2xl font-light mb-6">Configuración del Sistema</h2>
              
              <div className="space-y-6">
                {/* Sección de Perfil */}
                <div className={`${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'} rounded-lg p-6`}>
                  <h3 className={`text-lg font-light mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    Perfil de Usuario
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className={`block text-sm font-light mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Nombre
                      </label>
                      <p className={`text-base ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {currentUser?.name || 'Usuario'}
                      </p>
                    </div>
                    <div>
                      <label className={`block text-sm font-light mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Correo Electrónico
                      </label>
                      <p className={`text-base ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {currentUser?.email || 'email@ejemplo.com'}
                      </p>
                    </div>
                    <div>
                      <label className={`block text-sm font-light mb-2 ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Rol
                      </label>
                      <p className={`text-base capitalize ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {currentUser?.role || 'operador'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Sección de Preferencias */}
                <div className={`${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'} rounded-lg p-6`}>
                  <h3 className={`text-lg font-light mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    Preferencias
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`font-light ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                          Modo Oscuro
                        </p>
                        <p className={`text-sm font-light ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                          Activar tema oscuro en la interfaz
                        </p>
                      </div>
                      <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          darkMode ? 'bg-blue-500' : 'bg-slate-300'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          darkMode ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sección de Información */}
                <div className={`${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'} rounded-lg p-6`}>
                  <h3 className={`text-lg font-light mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                    Información del Sistema
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className={`font-light ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Versión
                      </span>
                      <span className={`${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        1.0.0
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={`font-light ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Última actualización
                      </span>
                      <span className={`${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        {new Date().toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          
        </div>
        
      </main>
    </div>
  );
}