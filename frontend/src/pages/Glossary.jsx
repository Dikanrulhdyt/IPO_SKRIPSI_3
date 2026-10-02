import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, BookOpen } from 'lucide-react';

// ============================================================
// DATA GLOSSARY
// ============================================================
const glossaryData = [
  {
    term: 'Asset Turnover',
    definition:
      'Rasio yang menunjukkan efisiensi aset yang dimiliki perusahaan dalam menghasilkan penjualan. Dihitung dengan membagi pendapatan dengan total aset. Semakin besar rasionya, semakin tinggi efisiensi perusahaan.',
    formula: 'Asset Turnover = Sales / Average Total Asset',
    explanation:
      'Rasio ini berguna untuk membandingkan efisiensi penggunaan aset sebuah perusahaan dengan perusahaan lain dalam industri yang sama. Nilai yang semakin tinggi menunjukkan perusahaan semakin efisien dalam memanfaatkan asetnya.',
  },
  {
    term: 'Auto Rejection',
    definition:
      'Mekanisme penolakan otomatis atas pesanan jual/beli saham ketika harga melampaui batas atas (ARA) atau batas bawah (ARB) yang ditetapkan BEI dalam satu sesi perdagangan.',
    formula: 'ARA: 35% (Rp50–200), 25% (Rp200–5.000), 20% (>Rp5.000)',
    explanation:
      'Mekanisme ini bertujuan menjaga perdagangan tetap wajar dan membatasi fluktuasi harga ekstrem. Pada saham IPO, ARA hari pertama sering dianggap ekspektasi keuntungan bagi investor.',
  },
  {
    term: 'Bubble Warning',
    definition:
      'Peringatan yang muncul di sistem ketika estimasi initial return melebihi batas ARA yang berlaku di BEI, mengindikasikan potensi terbentuknya gelembung harga (price bubble).',
    formula: 'Bubble Warning aktif jika Estimasi IR > Batas ARA',
    explanation:
      'Lonjakan harga ekstrem dalam waktu singkat tidak selalu mencerminkan nilai fundamental perusahaan. Peringatan ini membantu investor berhati-hati terhadap risiko koreksi tajam.',
  },
  {
    term: 'Emiten',
    definition:
      'Perusahaan yang melakukan penawaran umum saham kepada publik (IPO) atau perusahaan yang sudah tercatat dan memperdagangkan sahamnya di bursa efek.',
    formula: '-',
    explanation:
      'Emiten wajib memenuhi persyaratan OJK dan BEI, termasuk penyampaian prospektus dan laporan keuangan yang telah diaudit.',
  },
  {
    term: 'e-IPO',
    definition:
      'Platform elektronik yang dikelola BEI dan OJK untuk memfasilitasi penawaran saham perdana kepada investor ritel secara online.',
    formula: '-',
    explanation:
      'Melalui e-IPO, investor dapat memesan saham IPO tanpa harus menghubungi sekuritas secara manual. Sistem ini meningkatkan inklusi investor ritel di pasar modal Indonesia.',
  },
  {
    term: 'Free Float',
    definition:
      'Persentase saham perusahaan yang beredar dan dapat diperdagangkan secara bebas oleh publik di pasar sekunder.',
    formula: 'Free Float = (Jumlah Saham Publik / Total Saham Tercatat) × 100%',
    explanation:
      'Saham yang dimiliki pemegang saham pengendali tidak termasuk dalam perhitungan free float. Semakin besar free float, semakin likuid saham tersebut.',
  },
  {
    term: 'Initial Public Offering (IPO)',
    definition:
      'Kegiatan pertama kali suatu perusahaan menawarkan dan menjual sahamnya kepada publik melalui pasar modal untuk memperoleh tambahan modal.',
    formula: '-',
    explanation:
      'IPO mengubah status perusahaan dari tertutup menjadi terbuka, meningkatkan transparansi, tata kelola, dan kepercayaan publik.',
  },
  {
    term: 'Initial Return (IR)',
    definition:
      'Keuntungan atau kerugian yang diperoleh investor pada hari pertama perdagangan saham di pasar sekunder, dihitung dari selisih harga penutupan hari pertama dengan harga IPO.',
    formula: 'IR = (P₁ - P₀) / P₀',
    explanation:
      'Nilai IR positif menunjukkan investor untung (underpricing), sedangkan IR negatif menunjukkan investor rugi (overpricing). IR menjadi dasar penentuan label keberhasilan IPO di sistem ini.',
  },
  {
    term: 'Kapitalisasi Pasar (Market Cap)',
    definition:
      'Nilai total perusahaan di pasar modal, dihitung dari harga saham dikalikan jumlah saham beredar.',
    formula: 'Market Cap = Harga Saham × Jumlah Saham Beredar',
    explanation:
      'Digunakan untuk mengkategorikan ukuran perusahaan (Kecil, Sedang, Besar) dan membandingkan skala emiten.',
  },
  {
    term: 'Lot',
    definition:
      'Satuan perdagangan saham di Bursa Efek Indonesia, di mana 1 lot sama dengan 100 lembar saham.',
    formula: '1 Lot = 100 Lembar Saham',
    explanation:
      'Semua transaksi saham di BEI menggunakan satuan lot, bukan lembar, untuk memudahkan pencatatan dan efisiensi transaksi.',
  },
  {
    term: 'Maximum Likelihood Estimation (MLE)',
    definition:
      'Metode statistik untuk mencari nilai koefisien (β) yang paling optimal dengan memaksimalkan peluang (likelihood) terjadinya data yang diamati.',
    formula: 'ℓ(β) = Σ [yᵢ·log(Pᵢ) + (1-yᵢ)·log(1-Pᵢ)]',
    explanation:
      'MLE digunakan dalam training model regresi logistik untuk menemukan koefisien terbaik yang paling sesuai dengan data historis.',
  },
  {
    term: 'Overpricing',
    definition:
      'Kondisi ketika harga saham di pasar sekunder lebih rendah daripada harga IPO, sehingga investor mengalami kerugian pada hari pertama.',
    formula: 'Overpricing terjadi jika IR < 0',
    explanation:
      'Kebalikan dari underpricing. Emiten diuntungkan karena dana yang dihimpun optimal, tetapi investor mengalami kerugian.',
  },
  {
    term: 'Probabilitas Sukses',
    definition:
      'Peluang yang dihasilkan model regresi logistik bahwa suatu IPO akan memberikan initial return positif pada hari pertama perdagangan.',
    formula: 'P(Y=1) = 1 / (1 + e⁻ᶻ), dengan z = β₀ + β₁X₁ + ... + βₙXₙ',
    explanation:
      'Jika P > 0,5 maka IPO diprediksi SUKSES, dan jika P ≤ 0,5 maka diprediksi TIDAK SUKSES. Probabilitas dihitung menggunakan fungsi sigmoid.',
  },
  {
    term: 'Regresi Logistik',
    definition:
      'Algoritma supervised learning untuk klasifikasi biner yang menghasilkan probabilitas suatu kejadian menggunakan fungsi sigmoid.',
    formula: 'σ(z) = 1 / (1 + e⁻ᶻ)',
    explanation:
      'Dipilih karena outputnya probabilistik, mudah diinterpretasikan, dan cocok untuk data dengan variabel campuran numerik dan kategorikal.',
  },
  {
    term: 'Retraining',
    definition:
      'Proses pelatihan ulang model machine learning menggunakan data IPO terbaru untuk menjaga akurasi dan relevansi prediksi.',
    formula: '-',
    explanation:
      'Dilakukan oleh administrator melalui antarmuka sistem. Berguna untuk mengatasi concept drift seiring perubahan kondisi pasar.',
  },
  {
    term: 'Sektor Industri',
    definition:
      'Klasifikasi bisnis perusahaan berdasarkan IDX Industrial Classification (IDX-IC), seperti Teknologi, Keuangan, Energi, Kesehatan, dan lain-lain.',
    formula: '-',
    explanation:
      'Setiap sektor memiliki karakteristik risiko dan prospek yang berbeda. Variabel ini di-encode menggunakan one-hot encoding sebelum masuk model.',
  },
  {
    term: 'Underpricing',
    definition:
      'Fenomena ketika harga saham di pasar perdana (IPO) lebih rendah daripada harga di pasar sekunder hari pertama, sehingga investor memperoleh keuntungan.',
    formula: 'Underpricing terjadi jika IR > 0',
    explanation:
      'Fenomena ini umum terjadi di pasar modal Indonesia. Rata-rata underpricing BEI berada di kisaran 26%–43%.',
  },
  {
    term: 'Underwriter',
    definition:
      'Perusahaan efek (sekuritas) yang bertindak sebagai penjamin emisi dalam proses IPO, bertanggung jawab membantu penetapan harga, pemasaran, dan distribusi saham kepada investor.',
    formula: '-',
    explanation:
      'Underwriter berpengalaman dan bereputasi baik menjadi sinyal kredibilitas yang mengurangi asimetri informasi antara emiten dan investor.',
  },
  {
    term: 'Yahoo Finance API',
    definition:
      'Layanan API yang menyediakan data keuangan historis dan real-time, termasuk harga saham, digunakan untuk mengambil harga penutupan hari pertama (close day-1).',
    formula: '-',
    explanation:
      'Diakses melalui pustaka yfinance pada Python untuk menghitung initial return dari setiap emiten.',
  },
];

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// ============================================================
// KOMPONEN
// ============================================================
const Glossary = () => {
  const [search, setSearch] = useState('');
  const [activeLetter, setActiveLetter] = useState(null);
  const [selected, setSelected] = useState(glossaryData[0]);

  // Filter berdasarkan search & huruf
  const filtered = useMemo(() => {
    let list = glossaryData;

    if (activeLetter) {
      list = list.filter((item) =>
        item.term.toUpperCase().startsWith(activeLetter)
      );
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((item) => item.term.toLowerCase().includes(q));
    }

    return list;
  }, [search, activeLetter]);

  // Daftar huruf yang tersedia
  const availableLetters = useMemo(() => {
    const set = new Set(glossaryData.map((i) => i.term[0].toUpperCase()));
    return set;
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          Glossary
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Kamus istilah pasar modal dan machine learning yang digunakan dalam sistem ini.
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Cari istilah..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Layout 3 Kolom */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* KOLOM 1: A-Z Index */}
        <Card className="lg:col-span-2 border shadow-sm h-fit lg:sticky lg:top-20">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setActiveLetter(null)}
                className={`w-8 h-8 rounded-md text-xs font-semibold transition-all ${
                  activeLetter === null
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                #
              </button>
              {ALPHABET.map((letter) => {
                const isAvailable = availableLetters.has(letter);
                const isActive = activeLetter === letter;
                return (
                  <button
                    key={letter}
                    onClick={() => isAvailable && setActiveLetter(letter)}
                    disabled={!isAvailable}
                    className={`w-8 h-8 rounded-md text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isAvailable
                        ? 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                        : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* KOLOM 2: Daftar Istilah */}
        <Card className="lg:col-span-4 border shadow-sm">
          <CardContent className="p-0 max-h-[70vh] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="text-center py-10 text-sm text-muted-foreground">
                Tidak ada istilah yang cocok
              </div>
            ) : (
              <ul className="divide-y">
                {filtered.map((item) => {
                  const isActive = selected?.term === item.term;
                  return (
                    <li key={item.term}>
                      <button
                        onClick={() => setSelected(item)}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-600'
                            : 'hover:bg-gray-50 text-gray-700 border-l-4 border-transparent'
                        }`}
                      >
                        {item.term}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* KOLOM 3: Detail */}
        <Card className="lg:col-span-6 border shadow-sm">
          <CardContent className="p-6 space-y-6">
            {selected ? (
              <>
                {/* Judul */}
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {selected.term}
                  </h2>
                </div>

                {/* Definition */}
                <div>
                  <h3 className="text-sm font-bold uppercase text-blue-600 mb-2">
                    Definition
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selected.definition}
                  </p>
                </div>

                {/* Formula */}
                {selected.formula && selected.formula !== '-' && (
                  <div>
                    <h3 className="text-sm font-bold uppercase text-blue-600 mb-2">
                      Formula
                    </h3>
                    <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
                      <code className="text-sm text-gray-800 font-mono">
                        {selected.formula}
                      </code>
                    </div>
                  </div>
                )}

                {/* Explanation */}
                <div>
                  <h3 className="text-sm font-bold uppercase text-blue-600 mb-2">
                    Explanation
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {selected.explanation}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-10 text-muted-foreground text-sm">
                Pilih istilah dari daftar
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Glossary;