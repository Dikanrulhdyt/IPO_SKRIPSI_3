import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  PlusCircle, 
  Trash2, 
  Search, 
  Loader2, 
  ArrowLeft,
  Building2,
  Calendar,
  DollarSign,
  Percent,
  Users,
  Layers,
  AlertCircle,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:3000/api';

const AdminPanel = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [retraining, setRetraining] = useState(false);
  const [sektors, setSektors] = useState([]);
  
  // Mode: 'add' atau 'delete'
  const [mode, setMode] = useState('add');

  // Form Tambah
  const [form, setForm] = useState({
    kode_emiten: '',
    nama_emiten: '',
    tanggal_ipo: '',
    harga_ipo: '',
    jumlah_lot: '',
    free_float: '',
    sektor_nama: '',
    underwriter_ids: ''
  });

  // Form Hapus
  const [searchKode, setSearchKode] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Cek autentikasi admin
  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'admin') {
      navigate('/login');
    }
  }, [navigate]);

  // Ambil daftar sektor
  useEffect(() => {
    axios.get(`${API_BASE}/admin/sektors`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(res => setSektors(res.data)).catch(console.error);
  }, []);

  // ===== TAMBAH IPO =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        harga_ipo: parseFloat(form.harga_ipo),
        jumlah_lot: parseInt(form.jumlah_lot),
        free_float: parseFloat(form.free_float),
        underwriter_ids: form.underwriter_ids.split(',').map(s => s.trim().toUpperCase()).filter(Boolean)
      };
      await axios.post(`${API_BASE}/admin/ipo`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert('✅ IPO berhasil ditambahkan! Silakan Retrain.');
      setForm({
        kode_emiten: '', nama_emiten: '', tanggal_ipo: '',
        harga_ipo: '', jumlah_lot: '', free_float: '',
        sektor_nama: '', underwriter_ids: ''
      });
    } catch (err) {
      alert('❌ Error: ' + err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== CARI IPO UNTUK DIHAPUS =====
  const handleSearch = async () => {
    if (!searchKode.trim()) {
      setSearchError('Masukkan kode emiten');
      return;
    }
    setSearchLoading(true);
    setSearchError(null);
    setSearchResult(null);
    try {
      const res = await axios.get(`${API_BASE}/admin/ipo/${searchKode.trim().toUpperCase()}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSearchResult(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setSearchError(`IPO dengan kode "${searchKode.toUpperCase()}" tidak ditemukan`);
      } else {
        setSearchError(err.response?.data?.error || err.message);
      }
      setSearchResult(null);
    } finally {
      setSearchLoading(false);
    }
  };

  // ===== HAPUS IPO =====
  const handleDelete = async () => {
    if (!searchResult) return;
    if (!confirm(`Yakin ingin menghapus IPO ${searchResult.kode_emiten} (${searchResult.nama_emiten})?`)) return;
    
    setLoading(true);
    try {
      await axios.delete(`${API_BASE}/admin/ipo/${searchResult.id_ipo}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert(`✅ IPO ${searchResult.kode_emiten} berhasil dihapus!`);
      setSearchResult(null);
      setSearchKode('');
    } catch (err) {
      alert('❌ Error: ' + err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== RETRAIN =====
  const handleRetrain = async () => {
    if (!confirm('Retraining akan memakan waktu beberapa menit. Lanjutkan?')) return;
    setRetraining(true);
    try {
      const res = await axios.post(`${API_BASE}/admin/retrain`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      alert(res.data.message);
    } catch (err) {
      alert('❌ Retraining gagal: ' + err.response?.data?.error || err.message);
    } finally {
      setRetraining(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Format rupiah
  const formatRupiah = (angka) => {
    if (!angka) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(angka);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" />
            Admin Panel
          </h1>
          <p className="text-sm text-gray-500">Kelola data IPO dan training model</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Logout
        </Button>
      </div>

      {/* Tombol Mode: Tambah / Hapus */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant={mode === 'add' ? 'default' : 'outline'}
          onClick={() => setMode('add')}
          className={`py-6 text-base font-semibold transition-all duration-200 ${
            mode === 'add' 
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200' 
              : 'border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50'
          }`}
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Tambah IPO
        </Button>
        <Button
          variant={mode === 'delete' ? 'default' : 'outline'}
          onClick={() => setMode('delete')}
          className={`py-6 text-base font-semibold transition-all duration-200 ${
            mode === 'delete' 
              ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-200' 
              : 'border-2 border-dashed border-gray-300 hover:border-red-400 hover:bg-red-50'
          }`}
        >
          <Trash2 className="w-5 h-5 mr-2" />
          Hapus IPO
        </Button>
      </div>

      {/* ===== FORM TAMBAH ===== */}
      {mode === 'add' && (
        <Card className="border-0 shadow-lg shadow-gray-200/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              Tambah Data IPO Baru
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Kode Emiten</Label>
                  <Input
                    value={form.kode_emiten}
                    onChange={(e) => setForm({...form, kode_emiten: e.target.value.toUpperCase()})}
                    placeholder="Contoh : BBCA"
                    className="border-gray-200 focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Nama Emiten</Label>
                  <Input
                    value={form.nama_emiten}
                    onChange={(e) => setForm({...form, nama_emiten: e.target.value})}
                    placeholder="PT Contoh Tbk"
                    className="border-gray-200 focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  Tanggal IPO
                </Label>
                <Input
                  type="date"
                  value={form.tanggal_ipo}
                  onChange={(e) => setForm({...form, tanggal_ipo: e.target.value})}
                  className="border-gray-200 focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    Harga IPO (Rp)
                  </Label>
                  <Input
                    type="number"
                    value={form.harga_ipo}
                    onChange={(e) => setForm({...form, harga_ipo: e.target.value})}
                    placeholder="1500"
                    className="border-gray-200 focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Jumlah Lot</Label>
                  <Input
                    type="number"
                    value={form.jumlah_lot}
                    onChange={(e) => setForm({...form, jumlah_lot: e.target.value})}
                    placeholder="5000000"
                    className="border-gray-200 focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Percent className="w-4 h-4 text-gray-400" />
                    Free Float (%)
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={form.free_float}
                    onChange={(e) => setForm({...form, free_float: e.target.value})}
                    placeholder="25"
                    className="border-gray-200 focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-gray-400" />
                    Sektor
                  </Label>
                  <Select
                    value={form.sektor_nama}
                    onValueChange={(val) => setForm({...form, sektor_nama: val})}
                    required
                  >
                    <SelectTrigger className="border-gray-200 focus:ring-2 focus:ring-blue-500/20">
                      <SelectValue placeholder="Pilih Sektor" />
                    </SelectTrigger>
                    <SelectContent>
                      {sektors.map(s => (
                        <SelectItem key={s.sektor_id} value={s.nama_sektor}>
                          {s.nama_sektor}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    Underwriter (pisah koma)
                  </Label>
                  <Input
                    value={form.underwriter_ids}
                    onChange={(e) => setForm({...form, underwriter_ids: e.target.value})}
                    placeholder="CC, YP"
                    className="border-gray-200 focus:ring-2 focus:ring-blue-500/20"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full py-5 text-base font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 disabled:opacity-70 transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Menyimpan...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <PlusCircle className="w-5 h-5" />
                    Tambah IPO
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ===== FORM HAPUS ===== */}
      {mode === 'delete' && (
        <Card className="border-0 shadow-lg shadow-gray-200/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Hapus Data IPO
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Cari */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Label className="text-sm font-medium text-gray-700">Kode Emiten</Label>
                <Input
                  value={searchKode}
                  onChange={(e) => setSearchKode(e.target.value.toUpperCase())}
                  placeholder="Masukkan kode emiten (contoh: RANS)"
                  className="border-gray-200 focus:ring-2 focus:ring-red-500/20"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleSearch}
                  disabled={searchLoading}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200"
                >
                  {searchLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      <Search className="w-4 h-4" />
                      Cari
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* Hasil pencarian */}
            {searchError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-5 h-5" />
                {searchError}
              </div>
            )}

            {searchResult && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-semibold text-gray-800">Data ditemukan</span>
                  </div>
                  <span className="text-xs text-gray-400">ID: {searchResult.id_ipo}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500">Kode</p>
                    <p className="font-medium text-gray-800">{searchResult.kode_emiten}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Nama</p>
                    <p className="font-medium text-gray-800">{searchResult.nama_emiten}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Sektor</p>
                    <p className="font-medium text-gray-800">{searchResult.sektor_nama || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Tanggal IPO</p>
                    <p className="font-medium text-gray-800">
                      {searchResult.tanggal_ipo ? new Date(searchResult.tanggal_ipo).toLocaleDateString('id-ID') : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Harga IPO</p>
                    <p className="font-medium text-gray-800">{formatRupiah(searchResult.harga_ipo)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Initial Return</p>
                    <p className={`font-medium ${searchResult.initial_return > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {searchResult.initial_return ? (searchResult.initial_return * 100).toFixed(2) + '%' : '-'}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleDelete}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-200 disabled:opacity-70 transition-all duration-200"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Menghapus...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Trash2 className="w-5 h-5" />
                      Hapus IPO
                    </span>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ===== RETRAINING CARD ===== */}
      <Card className="border-0 shadow-lg shadow-gray-200/50 bg-gradient-to-br from-indigo-50/40 to-blue-50/40">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-indigo-600" />
            Retraining Model
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Memperbarui model dengan data IPO terbaru. Proses ini memakan waktu 2-5 menit.
          </p>
          <Button
            onClick={handleRetrain}
            disabled={retraining}
            className="w-full py-5 text-base font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-200 disabled:opacity-70 transition-all duration-200"
          >
            {retraining ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Sedang Retraining...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Retrain Model
              </span>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;