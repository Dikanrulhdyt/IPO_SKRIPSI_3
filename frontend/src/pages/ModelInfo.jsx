import { useEffect, useState } from 'react';
import { getModelInfo } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  XCircle,
  Info,
  BarChart3,
  Target,
  Award,
  Zap,
  Layers,
  AlertCircle,
  Loader2,
  Hash,
  PieChart,
  Activity   // <-- tambahan untuk AUC
} from 'lucide-react';

// ========== UTILITY ==========
const formatPercent = (val) => {
  if (val === undefined || val === null || isNaN(val)) return '0%';
  return (val * 100).toFixed(2) + '%';
};

const formatNumber = (num) => {
  if (num === undefined || num === null) return '-';
  return new Intl.NumberFormat('id-ID').format(num);
};

// ========== KOMPONEN UTAMA ==========
const ModelInfo = () => {
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getModelInfo()
      .then(res => {
        setMetadata(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message || 'Gagal memuat informasi model');
        setLoading(false);
      });
  }, []);

  // ===== LOADING =====
  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-lg shadow-gray-200/50">
          <CardHeader>
            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-4 w-72 bg-gray-100 rounded-lg animate-pulse mt-1" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="bg-gray-100 rounded-xl p-4 animate-pulse">
                  <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
                  <div className="h-6 w-16 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ===== ERROR =====
  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-lg shadow-gray-200/50">
          <CardContent className="py-16 text-center">
            <div className="bg-red-50 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <p className="text-red-500 text-lg font-medium">Gagal memuat informasi model</p>
            <p className="text-gray-400 text-sm mt-1">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Coba Ulang
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ===== EMPTY =====
  if (!metadata) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-lg shadow-gray-200/50">
          <CardContent className="py-16 text-center">
            <div className="bg-yellow-50 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Info className="w-10 h-10 text-yellow-500" />
            </div>
            <p className="text-gray-700 text-lg font-medium">Belum ada data model</p>
            <p className="text-gray-400 text-sm mt-1">Silakan lakukan training model terlebih dahulu</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ===== DESTRUCTURE =====
  const {
    model = 'Regresi Logistik',
    features = [],
    coefficients = {},
    evaluation = {}
  } = metadata;

  const {
    accuracy = 0,
    precision = 0,
    recall = 0,
    f1 = 0,
    auc_roc = 0,
    confusion_matrix = [[0, 0], [0, 0]]
  } = evaluation;

  const coefEntries = Object.entries(coefficients);
  const sortedCoefs = [...coefEntries].sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));

  const getCoefColor = (val) => {
    if (val > 0.1) return 'text-green-600 bg-green-50';
    if (val > 0) return 'text-green-500 bg-green-50/50';
    if (val < -0.1) return 'text-red-600 bg-red-50';
    if (val < 0) return 'text-red-500 bg-red-50/50';
    return 'text-gray-500 bg-gray-50';
  };



  // ===== RENDER =====
  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <Card className="border-0 shadow-lg shadow-gray-200/50 bg-gradient-to-br from-blue-50/80 to-indigo-50/80">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600/10 p-3 rounded-2xl">
                <Brain className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  {model}
                  <span className="text-sm font-normal text-gray-400 bg-white/80 px-3 py-1 rounded-full shadow-sm">
                    v1.0
                  </span>
                </CardTitle>
                <p className="text-sm text-gray-500 mt-0.5">
                  Model prediksi keberhasilan IPO menggunakan Regresi Logistik
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm bg-white/80 px-4 py-2 rounded-xl shadow-sm">
              <PieChart className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">Threshold 0%</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* ===== METRIK EVALUASI ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card className="border-0 shadow-md shadow-gray-200/50 bg-gradient-to-br from-blue-50 to-blue-100/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] cursor-default">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-blue-600/10 p-2.5 rounded-xl">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-blue-600/70 font-medium">Akurasi</p>
              <p className="text-xl font-bold text-blue-700">{formatPercent(accuracy)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md shadow-gray-200/50 bg-gradient-to-br from-green-50 to-green-100/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] cursor-default">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-green-600/10 p-2.5 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-green-600/70 font-medium">Presisi</p>
              <p className="text-xl font-bold text-green-700">{formatPercent(precision)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md shadow-gray-200/50 bg-gradient-to-br from-purple-50 to-purple-100/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] cursor-default">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-purple-600/10 p-2.5 rounded-xl">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-purple-600/70 font-medium">Recall</p>
              <p className="text-xl font-bold text-purple-700">{formatPercent(recall)}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md shadow-gray-200/50 bg-gradient-to-br from-amber-50 to-amber-100/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] cursor-default">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-amber-600/10 p-2.5 rounded-xl">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-amber-600/70 font-medium">F1-Score</p>
              <p className="text-xl font-bold text-amber-700">{formatPercent(f1)}</p>
            </div>
          </CardContent>
        </Card>

        {/* ===== AUC-ROC ===== */}
        <Card className="border-0 shadow-md shadow-gray-200/50 bg-gradient-to-br from-teal-50 to-teal-100/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] cursor-default">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-teal-600/10 p-2.5 rounded-xl">
              <Activity className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-xs text-teal-600/70 font-medium">AUC-ROC</p>
              <p className="text-xl font-bold text-teal-700">{formatPercent(auc_roc)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== CONFUSION MATRIX ===== */}
      <Card className="border-0 shadow-lg shadow-gray-200/50 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Confusion Matrix
            <span className="text-sm font-normal text-gray-400 ml-2">
              (Aktual vs Prediksi)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md mx-auto">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="text-sm font-medium text-gray-500"></div>
              <div className="text-sm font-semibold text-gray-700 bg-gray-50 py-1 rounded">Prediksi Sukses</div>
              <div className="text-sm font-semibold text-gray-700 bg-gray-50 py-1 rounded">Prediksi Gagal</div>
              
              <div className="text-sm font-semibold text-gray-700 bg-gray-50 py-1 rounded">Aktual Sukses</div>
              <div className="bg-green-100 p-3 rounded-lg text-green-700 font-bold text-lg">
                {formatNumber(confusion_matrix[1]?.[1] ?? 0)}
              </div>
              <div className="bg-red-100 p-3 rounded-lg text-red-700 font-bold text-lg">
                {formatNumber(confusion_matrix[1]?.[0] ?? 0)}
              </div>
              
              <div className="text-sm font-semibold text-gray-700 bg-gray-50 py-1 rounded">Aktual Gagal</div>
              <div className="bg-red-100 p-3 rounded-lg text-red-700 font-bold text-lg">
                {formatNumber(confusion_matrix[0]?.[1] ?? 0)}
              </div>
              <div className="bg-green-100 p-3 rounded-lg text-green-700 font-bold text-lg">
                {formatNumber(confusion_matrix[0]?.[0] ?? 0)}
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-100 rounded"></span> Benar</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-100 rounded"></span> Salah</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ===== FITUR & KOEFISIEN ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fitur */}
        <Card className="border-0 shadow-lg shadow-gray-200/50 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              Variabel yang Digunakan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-gray-700 py-1 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Koefisien */}
        <Card className="border-0 shadow-lg shadow-gray-200/50 bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Pengaruh Fitur (Koefisien)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {sortedCoefs.map(([name, coef]) => {
                const colorClass = getCoefColor(coef);
                const absCoef = Math.abs(coef);
                const barWidth = Math.min(absCoef * 100, 100);
                const isPositive = coef > 0;

                return (
                  <div key={name} className="space-y-0.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">{name}</span>
                      <span className={`font-mono font-medium px-2 py-0.5 rounded ${colorClass}`}>
                        {isPositive ? '+' : ''}{coef.toFixed(4)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-700 ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
                        style={{ width: `${barWidth}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 text-xs text-gray-400 flex justify-between">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"></span> Meningkatkan peluang sukses</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-500 rounded-full"></span> Menurunkan peluang sukses</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ===== INFORMASI TAMBAHAN ===== */}
      <Card className="border-0 shadow-lg shadow-gray-200/50 bg-gradient-to-br from-blue-50/40 to-indigo-50/40">
        <CardContent className="p-4 flex items-center gap-3 text-sm text-gray-500">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <p>
            Model ini dilatih dengan data historis IPO di Bursa Efek Indonesia. 
            Koefisien menunjukkan seberapa besar pengaruh setiap fitur terhadap 
            probabilitas keberhasilan IPO. Semakin besar nilai absolut, semakin besar pengaruhnya.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModelInfo;