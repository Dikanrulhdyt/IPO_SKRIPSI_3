import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, BookOpen } from 'lucide-react';

// ============================================================
// DATA GLOSSARY
// ============================================================
const glossaryData = [
  {
    term: 'Akurasi',
    definition:
      'Proporsi prediksi yang benar dari seluruh data pengujian yang digunakan untuk mengevaluasi kinerja model klasifikasi.',
    formula: 'Akurasi = (TP + TN) / (TP + TN + FP + FN)',
    explanation:
      'Akurasi menunjukkan seberapa banyak prediksi model yang benar secara keseluruhan.',
  },
  {
    term: 'Asset Turnover',
    definition:
      'Rasio yang menunjukkan efisiensi aset yang dimiliki perusahaan dalam menghasilkan penjualan. Dihitung dengan membagi pendapatan dengan total aset. Semakin besar rasionya, semakin tinggi efisiensi perusahaan.',
    formula: 'Asset Turnover = Sales / Average Total Asset',
    explanation:
      'Rasio ini berguna untuk membandingkan efisiensi penggunaan aset sebuah perusahaan dengan perusahaan lain dalam industri yang sama. Nilai yang semakin tinggi menunjukkan perusahaan semakin efisien dalam memanfaatkan asetnya.',
  },
  {
    term: 'AUC-ROC',
    definition:
      'Ukuran evaluasi yang menggambarkan kemampuan model klasifikasi dalam membedakan kelas positif dan kelas negatif pada berbagai nilai threshold.',
    formula: 'AUC = Area Under the Receiver Operating Characteristic Curve',
    explanation:
      'Nilai AUC-ROC menunjukkan kemampuan model dalam membedakan IPO sukses dan IPO tidak sukses. Nilai yang semakin tinggi menunjukkan kemampuan diskriminasi model yang semakin baik.',
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
    term: 'Avg Return',
    definition:
      'Nilai rata-rata initial return IPO yang berkaitan dengan suatu kelompok data atau underwriter berdasarkan data historis.',
    formula: 'Avg Return = Σ Initial Return / Jumlah IPO',
    explanation:
      'Avg Return digunakan untuk menggambarkan rata-rata tingkat return yang dihasilkan dari IPO berdasarkan data historis.',
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
    term: 'Dana Dihimpun',
    definition:
      'Jumlah dana yang diperoleh perusahaan melalui penawaran saham kepada publik dalam proses IPO.',
    formula: 'Dana Dihimpun = Harga IPO × Jumlah Saham yang Ditawarkan',
    explanation:
      'Dana dihimpun menggambarkan nilai modal yang berhasil diperoleh perusahaan melalui penawaran umum perdana.',
  },
  {
    term: 'Data Historis IPO',
    definition:
      'Kumpulan data IPO yang telah terjadi pada periode sebelumnya dan digunakan sebagai dasar analisis serta pelatihan model prediksi.',
    formula: '-',
    explanation:
      'Data historis IPO mencakup informasi seperti kode emiten, harga IPO, jumlah saham, free float, underwriter, sektor, dan initial return.',
  },
  {
    term: 'Distribusi IPO',
    definition:
      'Penyajian jumlah atau persebaran data IPO berdasarkan kategori tertentu untuk melihat pola dan komposisi data.',
    formula: '-',
    explanation:
      'Distribusi IPO dapat digunakan untuk melihat persebaran emiten berdasarkan sektor, tahun, atau kategori lainnya.',
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
    term: 'F1-Score',
    definition:
      'Nilai yang menggabungkan presisi dan recall dalam satu ukuran evaluasi kinerja model klasifikasi.',
    formula: 'F1-Score = 2 × (Presisi × Recall) / (Presisi + Recall)',
    explanation:
      'F1-Score digunakan untuk melihat keseimbangan antara kemampuan model menghasilkan prediksi positif yang tepat dan menemukan data positif.',
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
    term: 'IPO Per Tahun',
    definition:
      'Jumlah atau distribusi perusahaan yang melakukan Initial Public Offering pada setiap tahun dalam periode pengamatan.',
    formula: '-',
    explanation:
      'IPO per tahun digunakan untuk melihat perkembangan aktivitas IPO dari waktu ke waktu berdasarkan data historis.',
  },
  {
    term: 'IPO Sukses',
    definition:
      'IPO yang memiliki initial return positif pada hari pertama perdagangan saham di pasar sekunder.',
    formula: 'IPO Sukses jika IR > 0%',
    explanation:
      'Dalam sistem ini, IPO dikategorikan sukses apabila initial return lebih besar dari 0%, sedangkan initial return 0% atau negatif dikategorikan tidak sukses.',
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
    term: 'Kode Broker',
    definition:
      'Kode yang digunakan untuk mengidentifikasi perusahaan sekuritas atau broker yang terlibat dalam transaksi atau proses penjaminan emisi saham.',
    formula: '-',
    explanation:
      'Dalam sistem ini, kode broker digunakan untuk mengidentifikasi underwriter berdasarkan kode sekuritas yang tercatat pada data IPO.',
  },
  {
    term: 'Kode Emiten',
    definition:
      'Kode atau ticker saham yang digunakan untuk mengidentifikasi suatu emiten dalam perdagangan saham di Bursa Efek Indonesia.',
    formula: '-',
    explanation:
      'Kode emiten digunakan sebagai identitas singkat perusahaan dalam data IPO dan data perdagangan saham.',
  },
  {
    term: 'Koefisien',
    definition:
      'Nilai parameter pada model regresi logistik yang menunjukkan arah dan besarnya hubungan suatu variabel terhadap log odds terjadinya kelas yang diprediksi.',
    formula: 'z = β₀ + β₁X₁ + β₂X₂ + ... + βₙXₙ',
    explanation:
      'Koefisien positif menunjukkan peningkatan variabel berkaitan dengan peningkatan log odds kelas positif, sedangkan koefisien negatif menunjukkan arah sebaliknya.',
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
    term: 'Market Cap',
    definition:
      'Nilai kapitalisasi pasar perusahaan yang diperoleh dari perkalian harga saham dengan jumlah saham beredar.',
    formula: 'Market Cap = Harga Saham × Jumlah Saham Beredar',
    explanation:
      'Market Cap digunakan untuk menggambarkan nilai perusahaan berdasarkan harga pasar saham dan jumlah saham yang beredar.',
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
    term: 'Presisi',
    definition:
      'Proporsi prediksi positif yang benar-benar termasuk dalam kelas positif dari seluruh data yang diprediksi sebagai positif.',
    formula: 'Presisi = TP / (TP + FP)',
    explanation:
      'Presisi menunjukkan ketepatan model ketika memprediksi IPO sebagai IPO sukses.',
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
    term: 'Recall',
    definition:
      'Proporsi data positif yang berhasil dikenali atau diprediksi dengan benar oleh model.',
    formula: 'Recall = TP / (TP + FN)',
    explanation:
      'Recall menunjukkan kemampuan model dalam menemukan seluruh IPO yang sebenarnya termasuk dalam kategori sukses.',
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
    term: 'Success Rate',
    definition:
      'Persentase IPO sukses dari seluruh IPO yang ditangani atau termasuk dalam suatu kelompok data berdasarkan kriteria keberhasilan yang digunakan sistem.',
    formula: 'Success Rate = (Jumlah IPO Sukses / Total IPO) × 100%',
    explanation:
      'Success Rate digunakan untuk menunjukkan proporsi keberhasilan IPO berdasarkan data historis.',
  },
  {
    term: 'Threshold 0%',
    definition:
      'Batas nilai initial return yang digunakan untuk menentukan label keberhasilan IPO, yaitu IPO dinyatakan sukses apabila initial return lebih besar dari 0%.',
    formula: 'IPO Sukses jika IR > 0%; IPO Tidak Sukses jika IR ≤ 0%',
    explanation:
      'Threshold 0% digunakan sebagai batas klasifikasi antara IPO dengan initial return positif dan IPO dengan initial return nol atau negatif.',
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
    term: 'Ukuran IPO',
    definition:
      'Ukuran atau skala suatu IPO yang menggambarkan besarnya nilai penawaran berdasarkan harga IPO dan jumlah saham yang ditawarkan.',
    formula: 'Ukuran IPO = Harga IPO × Total Saham',
    explanation:
      'Ukuran IPO digunakan sebagai salah satu variabel untuk menggambarkan skala penawaran saham dalam analisis.',
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
                    onClick={() =>
                      isAvailable && setActiveLetter(letter)
                    }
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