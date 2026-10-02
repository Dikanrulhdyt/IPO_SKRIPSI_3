import { useLocation, useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Users, 
  Building2, 
  DollarSign, 
  Percent,
  Layers,
  BarChart3,
  AlertCircle,
  Info,
  Loader2,
  Wallet
} from 'lucide-react';

// ===== PERSENTIL DARI DATA HISTORIS =====
const P33 = 71400000000;
const P66 = 177260000000;

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state?.result;
  const contentRef = useRef(null);
  const [exporting, setExporting] = useState(false);

  if (!result) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Tidak ada hasil prediksi. Silakan lakukan prediksi terlebih dahulu.</p>
        <Button onClick={() => navigate('/predict')} className="mt-4">
          Kembali ke Prediksi
        </Button>
      </div>
    );
  }

  // ===== UTILITY =====
  const formatRupiah = (angka) => {
    if (angka === null || angka === undefined || isNaN(angka)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(angka);
  };

  const formatMiliar = (angka) => {
    if (!angka || angka === 0) return '0 M';
    return (angka / 1e9).toFixed(2) + ' M';
  };

  const formatPersen = (nilai) => {
    if (nilai === null || nilai === undefined || isNaN(nilai)) return '0%';
    return (nilai * 100).toFixed(1) + '%';
  };

  const getSizeBadge = (category) => {
    const styles = {
      Kecil: 'bg-blue-100 text-blue-800 border-blue-200',
      Sedang: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      Besar: 'bg-green-100 text-green-800 border-green-200',
    };
    return styles[category] || 'bg-gray-100 text-gray-800';
  };

  const isUnknownUW =
    result.underwriter_avg_return === 0 &&
    result.underwriter_jumlah_ipo === 0;

  // ===== EKSPORT PDF (LANDSCAPE) =====
  const exportPDF = async () => {
    if (!contentRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await toPng(contentRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        skipFonts: true,
      });
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const pdfWidth = 297;
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => {
        img.onload = () => {
          const pdfHeight = (img.height * pdfWidth) / img.width;
          pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save('hasil_prediksi_ipo.pdf');
          resolve();
        };
        img.onerror = () => {
          const pdfHeight = (contentRef.current.scrollHeight * pdfWidth) / contentRef.current.scrollWidth;
          pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save('hasil_prediksi_ipo.pdf');
          resolve();
        };
      });
    } catch (error) {
      console.error('Gagal export PDF:', error);
      alert('Gagal mengexport PDF. Silakan coba screenshot manual.');
    } finally {
      setExporting(false);
    }
  };

  // ===== LABEL KONTRIBUSI =====
  const getFriendlyLabel = (key) => {
    const map = {
      'uw_avg_return': 'Rata-rata Return UW',
      'uw_jumlah_ipo': 'Pengalaman UW',
      'uw_success_rate': 'Tingkat Sukses UW',
      'total_dana_dihimpun': 'Dana Dihimpun',
      'free_float': 'Free Float',
      'num_underwriters': 'Jumlah UW',
    };
    if (key.startsWith('sektor_')) {
      const sektorName = key.replace('sektor_', '');
      if (sektorName === result.sektor) {
        return `Sektor: ${sektorName}`;
      }
      return null;
    }
    return map[key] || key;
  };

  const allContributions = Object.entries(result.faktor_kontribusi || {})
    .filter(([key]) => {
      if (key === 'sektor') return false;
      if (key.startsWith('sektor_')) {
        return key.replace('sektor_', '') === result.sektor;
      }
      return true;
    })
    .map(([key, value]) => ({
      key,
      label: getFriendlyLabel(key),
      value
    }))
    .filter(item => item.label !== null);

  // ===== MARKET CAP POSITION =====
  const calculateMarketCapPercentile = (marketCap) => {
    if (!marketCap || marketCap <= 0) return 0;
    let position = 0;
    if (marketCap <= P33) {
      position = (marketCap / P33) * 33;
    } else if (marketCap <= P66) {
      position = 33 + ((marketCap - P33) / (P66 - P33)) * 33;
    } else {
      position = 66 + Math.min((marketCap - P66) / P66, 34) * 1;
    }
    return Math.min(Math.max(position, 0), 100);
  };

  const percentile = calculateMarketCapPercentile(result.market_cap);
  const formattedPercentile = percentile.toFixed(1);

  // ===== RENDER =====
  return (
    <div className="max-w-6xl mx-auto space-y-4 pb-6">
      {/* Tombol */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" onClick={() => navigate('/predict')} className="gap-1.5 text-sm px-3 py-1.5 h-auto">
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Button>
        <Button 
          onClick={exportPDF} 
          disabled={exporting}
          className="gap-1.5 text-sm px-4 py-1.5 h-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
        >
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {exporting ? 'Memproses...' : 'Export PDF'}
        </Button>
      </div>

      {/* KONTEN UTAMA */}
      <div 
        ref={contentRef} 
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        style={{ backgroundColor: '#ffffff' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Hasil Analisis IPO
            </h1>
            <p className="text-sm text-gray-500">{result.nama_emiten || 'IPO Baru'}</p>
          </div>
          <div className="text-xs text-gray-400">{new Date().toLocaleDateString('id-ID')}</div>
        </div>

        {/* Grid 2 kolom */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ===== KIRI ===== */}
          <div className="space-y-4">
            {/* PROBABILITAS */}
            <div>
              <div className="flex items-center gap-6">
                <div className="relative w-36 h-36 flex-shrink-0 mx-auto">
                  <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
                    <circle cx="60" cy="60" r="54" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                    <circle
                      cx="60" cy="60" r="54" fill="none"
                      stroke={result.probabilitas_sukses > 0.6 ? '#22c55e' : result.probabilitas_sukses > 0.4 ? '#eab308' : '#ef4444'}
                      strokeWidth="10"
                      strokeDasharray={`${result.probabilitas_sukses * 339.3} 339.3`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-800">{(result.probabilitas_sukses * 100).toFixed(0)}%</span>
                    <span className="text-[10px] text-gray-500 font-medium">Probabilitas Sukses</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    result.kategori === 'Sangat Menarik' ? 'bg-green-100 text-green-800' :
                    result.kategori === 'Menarik' ? 'bg-blue-100 text-blue-800' :
                    result.kategori === 'Netral' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {result.kategori}
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">Prediksi: <strong className={result.prediksi === 'SUKSES' ? 'text-green-600' : 'text-red-600'}>{result.prediksi}</strong></p>
                    <p className="text-sm text-gray-600">Estimasi Return: <strong>{formatPersen(result.estimasi_initial_return)}</strong></p>
                  </div>
                </div>
              </div>
            </div>

            {/* INPUT RINGKASAN */}
            <div className="grid grid-cols-3 gap-3 bg-gray-50 rounded-xl p-3 border border-gray-200">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-[10px] text-gray-400">Harga</p>
                  <p className="text-sm font-medium text-gray-700">{formatRupiah(result.harga_ipo)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-[10px] text-gray-400">Lot</p>
                  <p className="text-sm font-medium text-gray-700">{result.jumlah_lot?.toLocaleString() || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Percent className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-[10px] text-gray-400">Free Float</p>
                  <p className="text-sm font-medium text-gray-700">{result.free_float ?? '-'}%</p>
                </div>
              </div>
            </div>

            {/* TOTAL DANA & MARKET CAP */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-3 border border-blue-200/50">
                <p className="text-[10px] text-blue-600/70 font-medium flex items-center gap-1">
                  <Wallet className="w-4 h-4" />
                  Dana Dihimpun
                </p>
                <p className="text-base font-bold text-blue-700">{formatRupiah(result.total_dana_dihimpun)}</p>
                <p className="text-xs text-blue-500/70">{formatMiliar(result.total_dana_dihimpun)}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl p-3 border border-purple-200/50">
                <p className="text-[10px] text-purple-600/70 font-medium">Ukuran Market Cap</p>
                {/* Interpretasi di atas progress bar */}
                <div className="text-center mb-1">
                  <span className={`inline-block px-3 py-0.5 rounded-full text-sm font-bold border ${getSizeBadge(result.size_category)}`}>
                    {result.size_category || 'Kecil'}
                  </span>
                </div>
                {/* Progress bar + indikator di bawah */}
                <div className="relative mt-1">
                  <div className="flex h-3 rounded-full overflow-hidden bg-gray-200">
                    <div className="w-1/3 bg-blue-400"></div>
                    <div className="w-1/3 bg-yellow-400"></div>
                    <div className="w-1/3 bg-green-400"></div>
                  </div>
                  {/* Indikator panah menghadap ke bawah + persentase di atasnya */}
                  <div 
                    className="absolute top-full left-0 translate-x-[-50%] mt-1 flex flex-col items-center"
                    style={{ left: `${percentile}%` }}
                  >
                    <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent border-b-purple-700"></div>
                    <div className="text-[10px] font-bold text-purple-700 whitespace-nowrap">
                      {formattedPercentile}%
                    </div>
                  </div>
                </div>
                {/* Label 0% dan 100% dengan jarak cukup */}
                <div className="flex justify-between text-[9px] text-gray-400 mt-5">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===== KANAN ===== */}
          <div className="space-y-4">
            {/* STATISTIK UW RINGKASAN */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
              <p className="text-sm font-semibold text-gray-600 flex items-center gap-1.5 mb-2">
                <Users className="w-4 h-4" />
                Statistik Underwriter
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white rounded-lg p-2 border border-gray-100">
                  <p className="text-[10px] text-gray-400">Avg Return</p>
                  <p className="text-sm font-bold">{formatPersen(result.underwriter_avg_return)}</p>
                </div>
                <div className="bg-white rounded-lg p-2 border border-gray-100">
                  <p className="text-[10px] text-gray-400">Jumlah IPO</p>
                  <p className="text-sm font-bold">{result.underwriter_jumlah_ipo ?? 0}</p>
                </div>
                <div className="bg-white rounded-lg p-2 border border-gray-100">
                  <p className="text-[10px] text-gray-400">Success Rate</p>
                  <p className="text-sm font-bold">{formatPersen(result.underwriter_success_rate)}</p>
                </div>
              </div>
              {isUnknownUW && (
                <div className="mt-2 flex items-center gap-1 text-xs text-blue-600 bg-blue-50 p-1.5 rounded">
                  <Info className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Underwriter baru, dianggap netral.</span>
                </div>
              )}
            </div>

            {/* KONTRIBUSI FAKTOR */}
            {allContributions.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 flex-1">
                <p className="text-sm font-semibold text-gray-600 flex items-center gap-1.5 mb-2">
                  <TrendingUp className="w-4 h-4" />
                  Pengaruh Faktor
                </p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {allContributions.map(({ label, value }) => {
                    const isPositive = value >= 0;
                    const barWidth = Math.min(Math.abs(value), 100);
                    return (
                      <div key={label} className="flex items-center gap-2">
                        <span className="w-24 text-[10px] text-gray-600 truncate" title={label}>{label}</span>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <span className={`text-[10px] font-mono w-10 text-right ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {isPositive ? '+' : ''}{value.toFixed(1)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-[9px] text-gray-400 mt-1.5 text-center">*Kontribusi terhadap skor prediksi (logit)</p>
              </div>
            )}
          </div>
        </div>

        {/* ===== BAWAH: DETAIL PER UNDERWRITER (LIST UW) ===== */}
        {result.underwriter_details && result.underwriter_details.length > 0 && (
          <div className="mt-4 border-t border-gray-100 pt-3">
            <p className="text-xs font-medium text-gray-500 mb-2">Detail per Underwriter:</p>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {result.underwriter_details.map((uw, idx) => (
                <div key={idx} className="flex flex-wrap items-center justify-between gap-1 text-xs bg-white p-2 rounded border border-gray-200 shadow-sm">
                  <span className="font-medium text-gray-700 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-blue-500" />
                    {uw.underwriter_id}
                  </span>
                  <span className="text-gray-500">IPO: <strong>{uw.jumlah_ipo || 0}</strong></span>
                  <span className={`font-medium ${(uw.avg_return || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Return: {formatPersen(uw.avg_return)}
                  </span>
                  <span className="text-gray-500">Sukses: <strong>{formatPersen(uw.success_rate)}</strong></span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== BUBBLE WARNING ===== */}
        <div className="mt-3 space-y-1.5">
          {result.bubble_warning &&
            result.bubble_warning !== 'Normal' &&
            result.bubble_warning !== '⚡ Sukses tinggi (di atas rata-rata pasar)' && (
              <div className="flex items-start gap-1.5 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{result.bubble_warning}</span>
              </div>
            )}
          <div className="text-center text-[9px] text-gray-300 border-t border-gray-100 pt-2">
            IPO Predictor • Hasil prediksi bersifat indikatif
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;