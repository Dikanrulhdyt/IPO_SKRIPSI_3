import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import IPOData from './pages/IPOData';
import PredictIPO from './pages/PredictIPO';
import UWStats from './pages/UWStats';
import UWDetail from './pages/UWDetail';
import ModelInfo from './pages/ModelInfo';
import Login from './pages/Login';
import AdminPanel from './pages/AdminPanel';
import ResultPage from './pages/ResultPage';
import PrivateRoute from './components/PrivateRoute';
import LandingPage from './pages/LandingPage';
import Glossary from './pages/Glossary'; 
import { 
  BarChart3, 
  Database, 
  TrendingUp, 
  Users, 
  Info, 
  RefreshCw,
  Menu,
  X,
  BookOpen 
} from 'lucide-react';
import { useState } from 'react';

// ============================================================
// KOMPONEN NAVBAR
// ============================================================
function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = token && user.role === 'admin';

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/ipo-data', label: 'Data IPO', icon: Database },
    { path: '/predict', label: 'Analisis IPO', icon: TrendingUp },
    { path: '/uw-stats', label: 'Performa UW', icon: Users },
    { path: '/model-info', label: 'Tentang Model', icon: Info },
    { path: '/glossary', label: 'Glossary', icon: BookOpen },
  ];

  const isActive = (path) => location.pathname === path;

  // Tujuan tombol Retraining: jika sudah login admin -> /admin, jika belum -> /login
  const retrainPath = isAdmin ? '/admin' : '/login';

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200/80 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand / Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-2 rounded-xl shadow-md shadow-blue-200 group-hover:shadow-blue-300 transition-all duration-300">
              <BarChart3 className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-blue-600 bg-clip-text text-transparent hidden sm:block">
              IPO Predictor
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200/50'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}

            {/* Tombol Retraining DINAMIS */}
            <Link
              to={retrainPath}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                isActive(retrainPath)
                  ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200/50'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              Retraining
            </Link>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-all duration-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-gray-200/60 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.path)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            ))}

            {/* Retraining di mobile DINAMIS */}
            <Link
              to={retrainPath}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive(retrainPath)
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              Retraining
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

// ============================================================
// KOMPONEN APP CONTENT (berisi routing & layout)
// ============================================================
function AppContent() {
  const location = useLocation();
  const showNavbar = location.pathname !== "/";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/40">
      {showNavbar && <Navbar />}
      <main
        className={
          showNavbar
            ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
            : ""
        }
      >
        <Routes>
          {/* Landing Page (tanpa Navbar) */}
          <Route path="/" element={<LandingPage />} />

          {/* Dashboard (dengan Navbar) */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* IPO Data */}
          <Route path="/ipo-data" element={<IPOData />} />

          {/* Prediksi */}
          <Route path="/predict" element={<PredictIPO />} />
          <Route path="/predict/result" element={<ResultPage />} />

          {/* Underwriter */}
          <Route path="/uw-stats" element={<UWStats />} />
          <Route path="/uw/:uwId" element={<UWDetail />} />

          {/* Model Info */}
          <Route path="/model-info" element={<ModelInfo />} />

          {/* Glossary */}                             
          <Route path="/glossary" element={<Glossary />} />

          {/* Login */}
          <Route path="/login" element={<Login />} />

          {/* Admin (dengan PrivateRoute) */}
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <AdminPanel />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

// ============================================================
// APP UTAMA
// ============================================================
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;