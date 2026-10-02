import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { predictIPO, getUWStats, getSektors } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  Building2, 
  Users, 
  DollarSign, 
  Percent, 
  Layers, 
  Loader2,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Info,
  Briefcase
} from 'lucide-react';

// ========== KOMPONEN UTAMA ==========
const PredictIPO = () => {
  const navigate = useNavigate();
  const [uwList, setUwList] = useState([]);
  const [sektors, setSektors] = useState([]);
  const [loadingSektors, setLoadingSektors] = useState(true);
  const [formData, setFormData] = useState({
    nama_emiten: '',
    underwriter_ids: '',
    harga_ipo: '',
    jumlah_lot: '',
    free_float: '',
    sektor: ''
  });
  const [loading, setLoading] = useState(false);
  const [uwSuggestions, setUwSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedUwStats, setSelectedUwStats] = useState(null);

  // Fallback sektor jika API gagal
  const fallbackSektors = [
    'Consumer Cyclicals',
    'Financials',
    'Technology',
    'Energy',
    'Basic Materials',
    'Healthcare',
    'Infrastructures',
    'Properties & Real Estate',
    'Transportation & Logistic',
    'Industrials',
    'Consumer Non-Cyclicals'
  ];

  // Load daftar underwriter
  useEffect(() => {
    getUWStats()
      .then(res => {
        setUwList(res.data || []);
      })
      .catch(err => console.error('Error loading UW stats:', err));
  }, []);

  // Load daftar sektor dari API
  useEffect(() => {
    setLoadingSektors(true);
    getSektors()
      .then(res => {
        const data = res.data || [];
        if (Array.isArray(data) && data.length > 0) {
          if (data[0]?.nama_sektor) {
            setSektors(data.map(s => s.nama_sektor));
          } else {
            setSektors(data);
          }
        } else {
          setSektors(fallbackSektors);
        }
        setLoadingSektors(false);
      })
      .catch(err => {
        console.error('Error loading sektors:', err);
        setSektors(fallbackSektors);
        setLoadingSektors(false);
      });
  }, []);

  // Filter underwriter berdasarkan input
  const filteredUW = useMemo(() => {
    const input = formData.underwriter_ids.trim().toUpperCase();
    if (!input) return [];
    return uwList
      .filter(uw => uw.underwriter_id.includes(input))
      .slice(0, 5);
  }, [formData.underwriter_ids, uwList]);

  // Update suggestions ketika input berubah
  useEffect(() => {
    if (formData.underwriter_ids.trim().length > 0) {
      setUwSuggestions(filteredUW);
      setShowSuggestions(true);
    } else {
      setUwSuggestions([]);
      setShowSuggestions(false);
      setSelectedUwStats(null);
    }
  }, [filteredUW, formData.underwriter_ids]);

  // Pilih underwriter dari suggestion
  const selectUnderwriter = (uwId) => {
    setFormData(prev => ({ ...prev, underwriter_ids: uwId }));
    setShowSuggestions(false);
    const stats = uwList.find(uw => uw.underwriter_id === uwId);
    setSelectedUwStats(stats);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const ids = formData.underwriter_ids.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
      const payload = {
        nama_emiten: formData.nama_emiten,
        underwriter_ids: ids,
        harga_ipo: parseFloat(formData.harga_ipo),
        jumlah_lot: parseFloat(formData.jumlah_lot),
        free_float: parseFloat(formData.free_float),
        sektor: formData.sektor
      };
      const response = await predictIPO(payload);
      navigate('/predict/result', { state: { result: response.data } });
    } catch (err) {
      alert('Error: ' + err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-lg shadow-gray-200/50 bg-gradient-to-br from-blue-50/80 to-indigo-50/80">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600/10 p-3 rounded-2xl">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl">Analisis IPO Baru</CardTitle>
                <p className="text-sm text-gray-500 mt-0.5">
                  Prediksi probabilitas keberhasilan IPO menggunakan model ML
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-white/80 px-3 py-1.5 rounded-full shadow-sm">
              <Info className="w-3.5 h-3.5" />
              <span>Hasil prediksi dalam 2-3 detik</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Form Utama */}
      <Card className="border-0 shadow-lg shadow-gray-200/50 bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nama Emiten - Full Width */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-gray-400" />
                Nama / Kode Emiten
              </Label>
              <Input
                placeholder="Contoh: PT Trimegah Karya Pratama Tbk / UVCR"
                value={formData.nama_emiten}
                onChange={(e) => setFormData({...formData, nama_emiten: e.target.value})}
                className="border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                required
              />
            </div>

            {/* Dua Kolom: Underwriter & Sektor */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Underwriter */}
              <div className="space-y-1.5 relative">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  Underwriter (Broker)
                </Label>
                <div className="relative">
                  <Input
                    placeholder="Ketik kode underwriter (contoh: CC, YP)"
                    value={formData.underwriter_ids}
                    onChange={(e) => setFormData({...formData, underwriter_ids: e.target.value.toUpperCase()})}
                    className="border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    required
                  />
                  {showSuggestions && uwSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {uwSuggestions.map(uw => (
                        <button
                          key={uw.underwriter_id}
                          type="button"
                          onClick={() => selectUnderwriter(uw.underwriter_id)}
                          className="w-full text-left px-3 py-2 hover:bg-blue-50 transition-colors flex items-center justify-between text-sm"
                        >
                          <span className="font-medium">{uw.underwriter_id}</span>
                          <span className="text-xs text-gray-400">
                            {uw.jumlah_ipo || 0} IPO · {(uw.success_rate * 100).toFixed(0)}% sukses
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400">Pisahkan dengan koma jika lebih dari satu</p>
              </div>

              {/* Sektor - Mengambil dari API */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-gray-400" />
                  Sektor
                </Label>
                <Select
                  value={formData.sektor}
                  onValueChange={(val) => setFormData({...formData, sektor: val})}
                  required
                  disabled={loadingSektors}
                >
                  <SelectTrigger className="border-gray-200 bg-white focus:ring-2 focus:ring-blue-500/20 transition-all duration-200">
                    <SelectValue placeholder={loadingSektors ? "Memuat sektor..." : "Pilih Sektor"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200 shadow-lg rounded-lg max-h-60">
                    {loadingSektors ? (
                      <SelectItem value="loading" disabled className="text-gray-500">Memuat sektor...</SelectItem>
                    ) : (
                      sektors.map(s => (
                        <SelectItem key={s} value={s} className="hover:bg-blue-50 cursor-pointer">
                          {s}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {!loadingSektors && sektors.length === 0 && (
                  <p className="text-xs text-yellow-600">Tidak ada sektor tersedia. Periksa database.</p>
                )}
              </div>
            </div>

            {/* Tiga Kolom: Harga, Lot, Free Float */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Harga IPO */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  Harga IPO (Rp)
                </Label>
                <Input
                  type="number"
                  placeholder="1500"
                  value={formData.harga_ipo}
                  onChange={(e) => setFormData({...formData, harga_ipo: e.target.value})}
                  className="border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </div>

              {/* Jumlah Lot */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  Jumlah Lot
                </Label>
                <Input
                  type="number"
                  placeholder="5000000"
                  value={formData.jumlah_lot}
                  onChange={(e) => setFormData({...formData, jumlah_lot: e.target.value})}
                  className="border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </div>

              {/* Free Float */}
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-gray-400" />
                  Free Float (%)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="25"
                  value={formData.free_float}
                  onChange={(e) => setFormData({...formData, free_float: e.target.value})}
                  className="border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Statistik Underwriter (jika dipilih) */}
            {selectedUwStats && (
              <div className="bg-blue-50/60 rounded-xl p-4 border border-blue-200/50 mt-2">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-700 mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Statistik Underwriter {selectedUwStats.underwriter_id}
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">IPO Ditangani</p>
                    <p className="font-semibold text-gray-800">{selectedUwStats.jumlah_ipo || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Rata-rata Return</p>
                    <p className={`font-semibold ${(selectedUwStats.avg_return || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {((selectedUwStats.avg_return || 0) * 100).toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Success Rate</p>
                    <p className="font-semibold text-blue-700">
                      {((selectedUwStats.success_rate || 0) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tombol Submit */}
            <Button
              type="submit"
              disabled={loading || loadingSektors}
              className="w-full py-6 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg shadow-blue-200 hover:shadow-blue-300 disabled:opacity-70"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Memproses prediksi...
                </span>
              ) : loadingSektors ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Memuat data sektor...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Analisis IPO
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>

            {/* Info tambahan */}
            <div className="flex items-center gap-2 text-xs text-gray-400 pt-2 border-t border-gray-100">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Pastikan semua data diisi dengan benar untuk hasil prediksi yang akurat.</span>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictIPO;