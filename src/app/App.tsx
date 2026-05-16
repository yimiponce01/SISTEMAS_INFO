import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import FilterBar from './components/FilterBar';
import KPICards from './components/KPICards';
import ChartsSection from './components/ChartsSection';
import SmartAlertsPanel from './components/SmartAlertsPanel';
import UploadModule from './components/UploadModule';
import ActivityTracking from './components/ActivityTracking';
import ComparisonView from './components/ComparisonView';
import ExportReports from './components/ExportReports';
import LoginScreen from './components/LoginScreen';
import RegisterScreen from './components/RegisterScreen';
import ForgotPasswordScreen from './components/ForgotPasswordScreen';
import GaugeIndicators from './components/GaugeIndicators';
import Toast from './components/Toast';
import CompactKPICards from './components/CompactKPICards';


type AuthScreen = 'login' | 'register' | 'forgot';
type DashboardView = 'dashboard' | 'upload' | 'tracking' | 'settings' | 'alerts' | 'export';

interface User {
  name: string;
  email: string;
  role: 'administrador' | 'operador';
}

export default function App() {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Dashboard state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentView, setCurrentView] = useState<DashboardView>('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [selectedLivestock, setSelectedLivestock] = useState<'bovinos' | 'gallinas' | 'both'>('both');
  const [dateRange, setDateRange] = useState({ from: '2026-01-01', to: '2026-05-15' });

  // Authentication handlers
  const handleLogin = (email: string, password: string, rememberMe: boolean) => {
    // Mock authentication - in production, validate against backend
    const mockUser: User = {
      name: email.includes('admin') ? 'Juan Administrador' : 'María Operador',
      email: email,
      role: email.includes('admin') ? 'administrador' : 'operador',
    };
    setCurrentUser(mockUser);
    setIsAuthenticated(true);

    // Show welcome toast
    const roleText = mockUser.role === 'administrador' ? 'Administrador' : 'Operador';
    setToastMessage(`¡Bienvenido ${roleText}!`);
    setShowToast(true);
  };

  const handleRegister = (name: string, email: string, password: string, role: 'administrador' | 'operador') => {
    // Mock registration - in production, create user in backend
    const newUser: User = {
      name: name,
      email: email,
      role: role,
    };
    setCurrentUser(newUser);
    setIsAuthenticated(true);

    // Show welcome toast
    const roleText = role === 'administrador' ? 'Administrador' : 'Operador';
    setToastMessage(`¡Bienvenido ${roleText}!`);
    setShowToast(true);
  };

  const handleForgotPassword = (email: string) => {
    // Mock password recovery - in production, send recovery email
    console.log('Password recovery email sent to:', email);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    setAuthScreen('login');
  };

  const getPageTitle = () => {
    if (currentView === 'upload') return 'Añadir Registros';
    if (currentView === 'tracking') return 'Seguimiento';
    if (currentView === 'settings') return 'Configuración';
    if (currentView === 'alerts') return 'Alertas Inteligentes';
    if (currentView === 'export') return 'Exportar Reportes';
    if (selectedLivestock === 'bovinos') return 'Resumen Bovinos';
    if (selectedLivestock === 'gallinas') return 'Resumen Gallinas';
    return 'Bovinos vs Gallinas';
  };

  // Show authentication screens if not logged in
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
      <LoginScreen
        onLogin={handleLogin}
        onNavigateToRegister={() => setAuthScreen('register')}
        onNavigateToForgot={() => setAuthScreen('forgot')}
      />
    );
  }

  // Show dashboard after authentication
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
      <Toast
        message={toastMessage}
        show={showToast}
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
        darkMode={darkMode}
        userRole={currentUser?.role}
      />

      <main className="pt-16">
        <div className="max-w-[1600px] mx-auto px-6 py-8">
          {currentView === 'dashboard' && (
            <>
              <FilterBar
                selectedLivestock={selectedLivestock}
                setSelectedLivestock={setSelectedLivestock}
                dateRange={dateRange}
                setDateRange={setDateRange}
                darkMode={darkMode}
              />

              {/* Gauge Indicators */}
              <GaugeIndicators
                selectedLivestock={selectedLivestock}
                darkMode={darkMode}
              />

              {/* KPI Cards - Different display for 'both' mode */}
              {selectedLivestock === 'both' ? (
                <CompactKPICards darkMode={darkMode} />
              ) : (
                <KPICards
                  selectedLivestock={selectedLivestock}
                  dateRange={dateRange}
                  darkMode={darkMode}
                />
              )}

              {/* Charts and Alerts Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Charts Section - Left Side (2/3 width) */}
                <div className="lg:col-span-2">
                  {selectedLivestock === 'both' ? (
                    <ComparisonView darkMode={darkMode} dateRange={dateRange} />
                  ) : (
                    <ChartsSection
                      selectedLivestock={selectedLivestock}
                      dateRange={dateRange}
                      darkMode={darkMode}
                    />
                  )}
                </div>

                {/* Smart Alerts Panel - Right Side (1/3 width) */}
                <div className="lg:col-span-1">
                  <SmartAlertsPanel
                    selectedLivestock={selectedLivestock}
                    darkMode={darkMode}
                  />
                </div>
              </div>
            </>
          )}

          {currentView === 'upload' && (
            <UploadModule darkMode={darkMode} />
          )}

          {currentView === 'tracking' && (
            <ActivityTracking darkMode={darkMode} />
          )}

          {currentView === 'export' && (
            <ExportReports darkMode={darkMode} />
          )}

          {currentView === 'alerts' && (
            <div className={`${darkMode ? 'bg-slate-800 text-white' : 'bg-white'} rounded-lg border border-slate-200 p-8`}>
              <h2 className="text-2xl font-light mb-4">Alertas Inteligentes</h2>
              <SmartAlertsPanel selectedLivestock="both" darkMode={darkMode} fullScreen />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
