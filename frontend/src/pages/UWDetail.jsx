import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUWDetail } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  Users,
  PieChart,
  CheckCircle,
  XCircle,
  Loader2,
  Briefcase,
  Target
} from 'lucide-react';

// ===== UTILITY =====
const formatRupiah = (angka) => {
  if (!angka || angka === 0) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(angka);
};

const formatPersen = (angka) => {
  if (angka === null || angka === undefined || isNaN(angka)) return '0%';
  return (angka * 100).toFixed(2) + '%';
};

const formatTanggal = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// ===== FORMAT ANGKA (separator ribuan, tanpa embel-embel) =====
const formatAngka = (angka) => {
  if (!angka || isNaN(angka)) return '-';
  return new Intl.NumberFormat('id-ID').format(angka);
};

const UWDetail = () => {
  const { uwId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getUWDetail(uwId)
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message || 'Gagal memuat data');
        setLoading(false);
      });
  }, [uwId]);

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-8 w-64 bg-gray-200 rounded-lg animate-pulse" />
        </div>
        <Card className="border-0 shadow-lg shadow-gray-200/50">
          <CardHeader>
            <div className="h-6 w-40 bg-gray-200 rounded-lg animate-pulse" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="bg-gray-100 rounded-xl p-4 animate-pulse">
                  <div className="h-4 w-20 bg-gray-200 rounded mb-2" />
                  <div className="h-6 w-16 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/uw-stats">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Button>
          </Link>
        </div>
        <Card className="border-0 shadow-lg shadow-gray-200/50">
          <CardContent className="py-16 text-center">
            <div className="bg-red-50 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <p className="text-red-500 text-lg font-medium">Gagal memuat data</p>
            <p className="text-gray-400 text-sm mt-1">{error}</p>
            <Link to="/uw-stats">
              <Button variant="outline" className="mt-4 gap-2">
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Kinerja UW
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data || !data.underwriter_id) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link to="/uw-stats">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Button>
          </Link>
        </div>
        <Card className="border-0 shadow-lg shadow-gray-200/50">
          <CardContent className="py-16 text-center">
            <div className="bg-yellow-50 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <Building2 className="w-10 h-10 text-yellow-500" />
            </div>
            <p className="text-gray-700 text-lg font-medium">Underwriter tidak ditemukan</p>
            <p className="text-gray-400 text-sm mt-1">Kode "{uwId}" tidak terdaftar</p>
            <Link to="/uw-stats">
              <Button variant="outline" className="mt-4 gap-2">
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Kinerja UW
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const ipoList = data.ipo_list || [];
  const totalIPO = ipoList.length;
  const successCount = ipoList.filter(ipo => ipo.status_sukses === 'Sukses').length;
  const successRate = totalIPO > 0 ? successCount / totalIPO : 0;
  const avgReturn = totalIPO > 0 
    ? ipoList.reduce((sum, ipo) => sum + (ipo.initial_return || 0), 0) / totalIPO 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/uw-stats">
            <Button variant="ghost" className="gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-200">
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-blue-200">
              {data.underwriter_id.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{data.underwriter_id}</h1>
              <p className="text-sm text-gray-500 -mt-0.5">{data.underwriter_name || data.underwriter_id}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-xl">
          <Briefcase className="w-4 h-4" />
          <span>{totalIPO} IPO</span>
          <span className="w-px h-4 bg-gray-300 mx-2" />
          <Users className="w-4 h-4" />
          <span>{data.underwriter_name || data.underwriter_id}</span>
        </div>
      </div>

      {/* Statistik Ringkasan */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md shadow-gray-200/50 bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-blue-600/10 p-2.5 rounded-xl">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-blue-600/70 font-medium">Total IPO</p>
              <p className="text-xl font-bold text-blue-700">{totalIPO}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md shadow-gray-200/50 bg-gradient-to-br from-green-50 to-green-100/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-green-600/10 p-2.5 rounded-xl">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-green-600/70 font-medium">Sukses</p>
              <p className="text-xl font-bold text-green-700">{successCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md shadow-gray-200/50 bg-gradient-to-br from-purple-50 to-purple-100/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-purple-600/10 p-2.5 rounded-xl">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-purple-600/70 font-medium">Success Rate</p>
              <p className="text-xl font-bold text-purple-700">{(successRate * 100).toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md shadow-gray-200/50 bg-gradient-to-br from-amber-50 to-amber-100/50">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-amber-600/10 p-2.5 rounded-xl">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-amber-600/70 font-medium">Avg Return</p>
              <p className={`text-xl font-bold ${
                avgReturn > 0 ? 'text-green-600' : avgReturn < 0 ? 'text-red-600' : 'text-amber-700'
              }`}>
                {formatPersen(avgReturn)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabel IPO */}
      <Card className="border-0 shadow-lg shadow-gray-200/50 bg-white/80 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Daftar IPO yang Ditangani
            <span className="text-sm font-normal text-gray-400 ml-2">
              ({totalIPO} IPO)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {totalIPO === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-50 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Building2 className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-gray-500 text-lg">Belum ada IPO yang ditangani</p>
              <p className="text-gray-400 text-sm mt-1">Underwriter ini belum memiliki riwayat penanganan IPO</p>
            </div>
          ) : (
            <>
              <div className="border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50/80">
                      <TableRow className="hover:bg-transparent border-b border-gray-200/60">
                        <TableHead className="font-semibold text-gray-600">Kode</TableHead>
                        <TableHead className="font-semibold text-gray-600">Nama Perusahaan</TableHead>
                        <TableHead className="font-semibold text-gray-600">Sektor</TableHead>
                        <TableHead className="font-semibold text-gray-600">Underwriter</TableHead>
                        <TableHead className="text-right font-semibold text-gray-600">Initial Return</TableHead>
                        <TableHead className="text-right font-semibold text-gray-600">Harga IPO</TableHead>
                        <TableHead className="text-right font-semibold text-gray-600">Jumlah Lot</TableHead>
                        <TableHead className="text-right font-semibold text-gray-600">Free Float</TableHead>
                        <TableHead className="text-right font-semibold text-gray-600">Tanggal</TableHead>
                        <TableHead className="text-right font-semibold text-gray-600">Size IPO</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ipoList.map((ipo, idx) => {
                        const isPositive = (ipo.initial_return || 0) > 0;
                        const sizeClass = 
                          ipo.size_category === 'Kecil' ? 'bg-blue-100 text-blue-700' :
                          ipo.size_category === 'Sedang' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700';

                        const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30';

                        return (
                          <TableRow 
                            key={idx}
                            className={`transition-colors duration-150 hover:bg-blue-50/50 ${rowBg}`}
                          >
                            <TableCell className="font-medium text-gray-800">{ipo.kode_emiten}</TableCell>
                            <TableCell className="max-w-[150px] truncate text-gray-700" title={ipo.nama_emiten}>
                              {ipo.nama_emiten}
                            </TableCell>
                            <TableCell>
                              <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                                {ipo.sektor || '-'}
                              </span>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">
                              {data.underwriter_id}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={`inline-flex items-center gap-1 font-medium ${
                                isPositive ? 'text-green-600' : ipo.initial_return < 0 ? 'text-red-600' : 'text-gray-500'
                              }`}>
                                {isPositive ? <TrendingUp className="w-3 h-3" /> : ipo.initial_return < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                                {formatPersen(ipo.initial_return)}
                              </span>
                            </TableCell>
                            <TableCell className="text-right font-medium text-gray-700">
                              {formatRupiah(ipo.harga_ipo)}
                            </TableCell>
                            <TableCell className="text-right text-sm text-gray-600">
                              {formatAngka(ipo.jumlah_lot || ipo.jumlah_lot_saham || 0)}
                            </TableCell>
                            <TableCell className="text-right text-sm text-gray-600">
                              {ipo.free_float !== undefined && ipo.free_float !== null
                                ? ipo.free_float.toFixed(2) + '%'
                                : '-'
                              }
                            </TableCell>
                            <TableCell className="text-right text-sm text-gray-600">
                              {formatTanggal(ipo.tanggal_ipo)}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${sizeClass}`}>
                                {ipo.size_category || 'Kecil'}
                              </span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mt-4 text-sm text-gray-400">
                <span>Menampilkan {totalIPO} IPO yang ditangani oleh {data.underwriter_id} - {data.underwriter_name || data.underwriter_id}</span>
                <span className="flex items-center gap-1">
                  <PieChart className="w-3 h-3" />
                  {successRate >= 0.7 ? '🟢 Performa tinggi' : 
                   successRate >= 0.5 ? '🟡 Performa sedang' : 
                   '🔴 Performa rendah'}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UWDetail;