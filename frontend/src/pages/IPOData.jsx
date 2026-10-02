import { useEffect, useState, useCallback, useRef } from 'react';
import { getIpoData } from '../services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  BarChart3,
  Database,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2
} from 'lucide-react';

// ========== UTILITY FORMATTER ==========
const formatRupiah = (angka) => {
  if (!angka || angka === 0) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(angka);
};

// ===== FORMAT PERSEN =====
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

// ===== FORMAT ANGKA (dengan separator ribuan, tanpa embel-embel) =====
const formatAngka = (angka) => {
  if (!angka || isNaN(angka)) return '-';
  return new Intl.NumberFormat('id-ID').format(angka);
};

// ========== KOMPONEN UTAMA ==========
const IPOData = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState({
    page: 1,
    limit: 10,
    search: '',
    sortBy: 'tanggal_ipo',
    sortOrder: 'DESC',
  });

  const tableRef = useRef(null);

  const sortOptions = [
    { label: 'Tanggal Terbaru', sortBy: 'tanggal_ipo', sortOrder: 'DESC' },
    { label: 'Tanggal Terlama', sortBy: 'tanggal_ipo', sortOrder: 'ASC' },
    { label: 'Harga Tertinggi', sortBy: 'harga_ipo', sortOrder: 'DESC' },
    { label: 'Harga Terendah', sortBy: 'harga_ipo', sortOrder: 'ASC' },
    { label: 'Initial Return Tertinggi', sortBy: 'initial_return', sortOrder: 'DESC' },
    { label: 'Initial Return Terendah', sortBy: 'initial_return', sortOrder: 'ASC' },
  ];

  const activeSortLabel = sortOptions.find(
    opt => opt.sortBy === params.sortBy && opt.sortOrder === params.sortOrder
  )?.label || 'Tanggal Terbaru';

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getIpoData(params);
      const items = response.data.data || [];
      const totalItems = response.data.total || 0;
      setData(items);
      setTotal(totalItems);
    } catch (error) {
      console.error('Error fetching IPO data:', error);
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(total / params.limit);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setParams(prev => ({ ...prev, page: newPage }));
      setTimeout(() => {
        if (tableRef.current) {
          tableRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const handleSortChange = (value) => {
    const option = sortOptions.find(opt => opt.label === value);
    if (option) {
      setParams(prev => ({
        ...prev,
        sortBy: option.sortBy,
        sortOrder: option.sortOrder,
        page: 1,
      }));
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, params.page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  if (loading && data.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-lg shadow-gray-200/50">
          <CardHeader>
            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-4 w-72 bg-gray-100 rounded-lg animate-pulse mt-1" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-10 w-48 bg-gray-100 rounded-lg animate-pulse" />
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-lg shadow-gray-200/50 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Database className="w-6 h-6 text-blue-600" />
                Data IPO Historis
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Daftar lengkap penawaran umum perdana (IPO) di Bursa Efek Indonesia
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-xl">
              <BarChart3 className="w-4 h-4" />
              <span>{total} IPO</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filter */}
      <Card className="border-0 shadow-md shadow-gray-200/50">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari berdasarkan nama perusahaan atau kode emiten..."
                value={params.search}
                onChange={(e) => setParams(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                className="pl-9 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            <div className="w-48">
              <Select value={activeSortLabel} onValueChange={handleSortChange}>
                <SelectTrigger className="border-gray-200 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 h-10 text-sm bg-white">
                  <SelectValue placeholder="Urutkan" />
                </SelectTrigger>
                <SelectContent className="max-h-60 bg-white border border-gray-200 shadow-lg rounded-lg">
                  {sortOptions.map(opt => (
                    <SelectItem key={opt.label} value={opt.label} className="text-sm hover:bg-blue-50">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-3 text-sm text-gray-400 flex justify-between items-center">
            <span>Menampilkan {data.length} dari {total} data</span>
            {params.search && (
              <span className="text-blue-600">Filter: "{params.search}"</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabel */}
      <Card 
        ref={tableRef}
        className="border-0 shadow-lg shadow-gray-200/50 bg-white/80 backdrop-blur-sm overflow-hidden scroll-mt-20"
      >
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-gray-50/80 sticky top-0">
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
                  {/* Total Dana dihapus - dikomentari */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12">
                      <div className="flex items-center justify-center gap-3 text-gray-400">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                        <span>Memuat data...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-16">
                      <div className="flex flex-col items-center gap-2 text-gray-400">
                        <Search className="w-10 h-10 text-gray-300" />
                        <p className="text-lg font-medium text-gray-500">Tidak ada data</p>
                        <p className="text-sm">Coba ubah filter atau cari dengan kata kunci lain</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((item, idx) => {
                    const isPositive = (item.initial_return || 0) > 0;
                    const sizeClass = 
                      item.size_category === 'Kecil' ? 'bg-blue-100 text-blue-700' :
                      item.size_category === 'Sedang' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700';

                    const rowBg = idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60';

                    // Jumlah lot langsung dari response API (sudah dalam lot)
                    const jumlahLot = item.jumlah_lot || item.jumlah_lot_saham || 0;

                    return (
                      <TableRow
                        key={idx}
                        className={`transition-all duration-200 ${rowBg} hover:bg-blue-100/70 hover:shadow-sm cursor-pointer`}
                      >
                        <TableCell className="font-medium text-gray-800">{item.kode_emiten}</TableCell>
                        <TableCell className="max-w-[180px] truncate" title={item.nama_emiten}>
                          {item.nama_emiten}
                        </TableCell>
                        <TableCell>
                          <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                            {item.sektor || '-'}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {item.underwriter_ids && item.underwriter_ids.length > 0
                            ? item.underwriter_ids.join(', ')
                            : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`inline-flex items-center gap-1 font-medium ${
                            isPositive ? 'text-green-600' : item.initial_return < 0 ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {isPositive ? <TrendingUp className="w-3 h-3" /> : item.initial_return < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                            {formatPersen(item.initial_return)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-medium text-gray-700">
                          {formatRupiah(item.harga_ipo)}
                        </TableCell>
                        <TableCell className="text-right text-sm text-gray-600">
                          {formatAngka(jumlahLot)}
                        </TableCell>
                        <TableCell className="text-right text-sm text-gray-600">
                          {item.free_float !== undefined && item.free_float !== null
                            ? item.free_float.toFixed(2) + '%'
                            : '-'
                          }
                        </TableCell>
                        <TableCell className="text-right text-sm text-gray-600">
                          {formatTanggal(item.tanggal_ipo)}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${sizeClass}`}>
                            {item.size_category || 'Kecil'}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && !loading && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 border-t border-gray-200/60">
              <div className="text-sm text-gray-400">
                Halaman {params.page} dari {totalPages}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={params.page === 1}
                  className="h-8 px-2"
                >
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                {getPageNumbers().map((pageNum) => (
                  <Button
                    key={pageNum}
                    variant={pageNum === params.page ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className={`h-8 w-8 ${
                      pageNum === params.page 
                        ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                        : 'hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    {pageNum}
                  </Button>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={params.page === totalPages}
                  className="h-8 px-2"
                >
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IPOData;