import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { login } from '../services/api';
import { 
  Lock, 
  User, 
  Shield, 
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await login(username, password);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      // Redirect ke admin jika admin, ke dashboard jika user biasa
      if (response.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login gagal. Periksa username dan password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Header dengan ikon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-200 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Akses Administrator</h1>
          <p className="text-sm text-gray-500 mt-1">Masukkan kredensial untuk mengelola data IPO</p>
        </div>

        <Card className="border-0 shadow-2xl shadow-gray-200/60 bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-gray-700">
              <Lock className="w-5 h-5 text-indigo-500" />
              Login Admin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  Username
                </Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                  required
                  autoFocus
                />
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-gray-400" />
                  Password
                </Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Tombol Login */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full py-5 text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-200 disabled:opacity-70 transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Memproses...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Login
                  </span>
                )}
              </Button>

              {/* Informasi Default */}
              <div className="mt-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                <p className="text-xs text-gray-500 text-center">
                  <span className="font-medium text-gray-700">🔑 Kredensial Default:</span>
                  <br />
                  <span className="font-mono text-sm text-indigo-600">admin</span>
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="font-mono text-sm text-indigo-600">Admin123</span>
                </p>
              </div>

              {/* Tombol kembali ke dashboard */}
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ← Kembali ke Dashboard
                </button>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} IPO Predictor • Hanya untuk administrator
        </p>
      </div>
    </div>
  );
};

export default Login;