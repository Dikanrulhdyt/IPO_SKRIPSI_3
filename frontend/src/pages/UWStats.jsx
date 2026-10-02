import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUWStats } from '../services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2, 
  ArrowUpDown,
  Eye,
  Award,
  BarChart3,
  Loader2
} from 'lucide-react';

const UWStats = () => {
  const [uwStats, setUwStats] = useState([]);
  const [filteredStats, setFilteredStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('avg_return');
  const [sortOrder, setSortOrder] = useState('DESC');

  // ===== FETCH DATA =====
  useEffect(() => {
    getUWStats()
      .then(res => {
        setUwStats(res.data || []);
        setFilteredStats(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading UW stats:', err);
        setLoading(false);
      });
  }, []);

  // ===== FILTER & SORT =====
  useEffect(() => {
    let result = [...uwStats];
    
    if (search) {
      const lower = search.toLowerCase();
      result = result.filter(item =>
        item.underwriter_id.toLowerCase().includes(lower) ||
        (item.nama_underwriter && item.nama_underwriter.toLowerCase().includes(lower))
      );
    }
    
    result.sort((a, b) => {
      let valA = a[sortBy] || 0;
      let valB = b[sortBy] || 0;
      if (sortOrder === 'ASC') return valA > valB ? 1 : -1;
      return valA < valB ? 1 : -1;
    });
    
    setFilteredStats(result);
  }, [search, sortBy, sortOrder, uwStats]);

  // ===== STATISTIK RINGKASAN (weighted) =====
  const validUW = uwStats.filter(uw => (uw.jumlah_ipo || 0) > 0);
  const totalUnderwriters = validUW.length;
  const totalIPO = validUW.reduce((sum, uw) => sum + (uw.jumlah_ipo || 0), 0);
  const totalSuccessWeighted = validUW.reduce(
    (sum, uw) => sum + ((uw.success_rate || 0) * (uw.jumlah_ipo || 0)), 
    0
  );
  const weightedAvgSuccessRate = totalIPO > 0 ? totalSuccessWeighted / totalIPO : 0;

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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-gray-100 rounded-xl p-4 animate-pulse">
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
                  <div className="h-8 w-16 bg-gray-200 rounded" />
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

  // ===== EMPTY =====
  if (uwStats.length === 0) {
    return (
      <div className="space-y-6">
        <Card className="border-0 shadow-lg shadow-gray-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Building2 className="w-6 h-6 text-blue-600" />
              Performa Underwriter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-16">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">Belum ada data underwriter</p>
              <p className="text-gray-400 text-sm">Data akan muncul setelah training model</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ===== RENDER =====
  return (
    <div className="space-y-6">
      {/* ===== HEADER ===== */}
      <Card className="border-0 shadow-lg shadow-gray-200/50 bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Building2 className="w-6 h-6 text-blue-600" />
                Performa Underwriter
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Analisis performa penjamin emisi (underwriter) dalam penanganan IPO
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-xl">
              <Users className="w-4 h-4" />
              <span>{totalUnderwriters} Underwriter</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* ===== TABEL ===== */}
      <Card className="border-0 shadow-lg shadow-gray-200/50 bg-white/80 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Daftar Underwriter
            <span className="text-sm font-normal text-gray-400 ml-2">
              ({filteredStats.length} ditampilkan)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari underwriter (kode atau nama)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 border-gray-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
              />
            </div>
            <div className="flex gap-2">
              <div className="w-36">
                <Select value={sortOrder} onValueChange={setSortOrder}>
                  <SelectTrigger className="border-gray-200 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200">
                    <SelectValue placeholder="Urutan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DESC">⬇ Tertinggi</SelectItem>
                    <SelectItem value="ASC">⬆ Terendah</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Tabel */}
          <div className="border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50/80">
                  <TableRow className="hover:bg-transparent border-b border-gray-200/60">
                    <TableHead className="font-semibold text-gray-600">Kode</TableHead>
                    <TableHead className="font-semibold text-gray-600">Nama Underwriter</TableHead>
                    <TableHead className="text-right font-semibold text-gray-600">Jumlah IPO</TableHead>
                    <TableHead className="text-right font-semibold text-gray-600">Avg Return</TableHead>
                    <TableHead className="text-right font-semibold text-gray-600">Success Rate</TableHead>
                    <TableHead className="text-center font-semibold text-gray-600">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStats.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                        <Search className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        Tidak ada underwriter yang sesuai dengan pencarian
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStats.map((uw, index) => {
                      const avgReturn = uw.avg_return || 0;
                      const successRate = uw.success_rate || 0;
                      const isPositive = avgReturn > 0;
                      
                      return (
                        <TableRow 
                          key={uw.underwriter_id}
                          className={`cursor-pointer transition-all duration-200 ${
                            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                          } hover:bg-blue-100/70 hover:shadow-sm`}
                        >
                          <TableCell className="font-medium">
                            <span className="inline-flex items-center gap-2">
                              <span className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-xs font-bold text-blue-700">
                                {uw.underwriter_id.charAt(0)}
                              </span>
                              {uw.underwriter_id}
                            </span>
                          </TableCell>
                          <TableCell 
                            className="text-gray-700 max-w-[180px] truncate" 
                            title={uw.nama_underwriter || uw.underwriter_id}
                          >
                            {uw.nama_underwriter || uw.underwriter_id}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {uw.jumlah_ipo || 0}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={`inline-flex items-center gap-1 font-medium ${
                              isPositive ? 'text-green-600' : avgReturn < 0 ? 'text-red-600' : 'text-gray-500'
                            }`}>
                              {isPositive ? <TrendingUp className="w-3 h-3" /> : avgReturn < 0 ? <TrendingDown className="w-3 h-3" /> : null}
                              {(avgReturn * 100).toFixed(2)}%
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                              successRate >= 0.7 ? 'bg-green-100 text-green-700' :
                              successRate >= 0.5 ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {successRate >= 0.7 ? '🟢' : successRate >= 0.5 ? '🟡' : '🔴'}
                              {(successRate * 100).toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Link to={`/uw/${uw.underwriter_id}`}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-all duration-200 gap-1.5"
                              >
                                <Eye className="w-4 h-4" />
                                Detail
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Footer */}
          {filteredStats.length > 0 && (
            <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
              <span>Menampilkan {filteredStats.length} dari {uwStats.length} underwriter</span>
              <span className="flex items-center gap-1">
                <ArrowUpDown className="w-3 h-3" />
                {sortBy === 'avg_return' ? 'Avg Return' : 
                 sortBy === 'success_rate' ? 'Success Rate' :
                 sortBy === 'jumlah_ipo' ? 'Jumlah IPO' : 'Kode'} 
                {sortOrder === 'DESC' ? ' (tertinggi)' : ' (terendah)'}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UWStats;