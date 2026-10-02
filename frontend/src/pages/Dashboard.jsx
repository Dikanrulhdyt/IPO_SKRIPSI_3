import { useEffect, useState } from 'react';
import { getDashboardStats } from '../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Building2, Percent, BarChart3, PieChart as PieChartIcon } from 'lucide-react';

// Warna konsisten untuk grafik
const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStats().then(response => {
      setStats(response.data);
      setLoading(false);
    }).catch(error => {
      console.error("Error fetching dashboard stats:", error);
      setLoading(false);
    });
  }, []);

  // Tampilan loading dengan skeleton
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-gray-200 rounded-xl"></div>
          <div className="h-80 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div className="text-red-500 text-center p-8">Gagal memuat data dashboard.</div>;
  }

  // ===== DATA PIE CHART: Distribusi IPO per Sektor =====
  // Asumsikan stats.sectorAvgReturn memiliki field 'count' atau 'jumlah'
  // Jika tidak ada, fallback ke avgReturn (dengan catatan)
  const pieData = (stats.sectorAvgReturn || []).map((item, index) => {
    // Cari nilai count: prioritas count > jumlah > avgReturn (fallback)
    const value = item.count || item.jumlah || item.avgReturn || 0;
    return {
      ...item,
      value: value,
      color: CHART_COLORS[index % CHART_COLORS.length],
      // Pastikan nameKey = 'sector' tetap ada
    };
  });

  // Total IPO untuk perhitungan persentase
  const totalIPO = stats.totalIPO || 0;

  return (
    <div className="space-y-8 p-4 md:p-6 bg-gradient-to-br from-slate-50 to-indigo-50/50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-indigo-500" />
            Dashboard IPO
          </h1>
          <p className="text-gray-500 mt-1">Ringkasan data penawaran umum perdana</p>
        </div>
        <div className="mt-2 md:mt-0 text-sm bg-white/70 px-4 py-2 rounded-full shadow-sm border border-gray-100">
          <span className="font-medium text-gray-600">Terakhir diperbarui:</span>{' '}
          <span className="text-gray-800">{new Date().toLocaleDateString('id-ID')}</span>
        </div>
      </div>

      {/* KARTU STATISTIK */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-blue-100/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Total IPO</CardTitle>
            <Building2 className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-blue-900">{stats.totalIPO}</p>
            <p className="text-xs text-blue-600 mt-1">Perusahaan tercatat</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-emerald-50 to-emerald-100/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Total Underwriter</CardTitle>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-emerald-900">{stats.totalUnderwriter}</p>
            <p className="text-xs text-emerald-600 mt-1">Lembaga penjamin</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-rose-50 to-rose-100/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-rose-700">Rata-rata Initial Return</CardTitle>
            <Percent className="h-5 w-5 text-rose-600" />
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-extrabold text-rose-900">{(stats.avgInitialReturn * 100).toFixed(2)}%</p>
            <p className="text-xs text-rose-600 mt-1">Imbal hasil awal</p>
          </CardContent>
        </Card>
      </div>

      {/* GRAFIK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart: IPO Per Tahun */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-700">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              IPO Per Tahun
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.ipoPerYear} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                <XAxis dataKey="year" tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  formatter={(value) => [`${value} IPO`, 'Jumlah']}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6,6,0,0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Pie Chart: Distribusi IPO per Sektor */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-700">
              <PieChartIcon className="w-5 h-5 text-pink-500" />
              Distribusi IPO per Sektor
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="sector"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={2}
                  label={({ sector, percent }) => `${sector} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ stroke: '#9ca3af', strokeWidth: 1 }}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => {
                    // Cek apakah ada field 'count' di payload
                    const payload = props?.payload;
                    if (payload && payload.count !== undefined) {
                      return [`${value} IPO (${((value / stats.totalIPO) * 100).toFixed(1)}%)`, 'Jumlah'];
                    }
                    return [`${(value * 100).toFixed(2)}%`, 'Rata-rata Return'];
                  }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 pt-4 border-t border-gray-200/50">
        © {new Date().getFullYear()} • Data disajikan untuk keperluan analisis
      </div>
    </div>
  );
};

export default Dashboard;