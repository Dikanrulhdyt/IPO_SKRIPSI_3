import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  TrendingUp,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import heroImage from "../assets/images/hero-ipo.png";

export default function LandingPage() {
  const navigate = useNavigate();

  const handleScrollDown = () => {
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#07142C] overflow-hidden flex items-center justify-center">
      {/* Background Glow */}
      <div className="fixed left-[-150px] bottom-[-150px] w-[350px] h-[350px] bg-purple-600 rounded-full blur-[150px] opacity-30 pointer-events-none" />
      <div className="fixed right-[-150px] top-[-150px] w-[300px] h-[300px] bg-blue-500 rounded-full blur-[140px] opacity-20 pointer-events-none" />

      <section className="relative w-full min-h-screen flex items-center justify-center px-6 sm:px-8 lg:px-12 py-8">
        <div className="max-w-6xl w-full mx-auto">
          <div className="grid lg:grid-cols-2 items-center gap-6 lg:gap-12">

            {/* LEFT CONTENT */}
            <div className="z-10 space-y-4 sm:space-y-5">
              {/* Badge */}
              <div className="inline-flex items-center rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-blue-300 text-[10px] sm:text-xs tracking-wide font-medium">
                <Sparkles className="w-3 h-3 mr-1.5 text-blue-400" />
                DATA • ANALISIS • PREDIKSI
              </div>

              {/* Heading */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-extrabold leading-tight text-white">
                Prediksi
                <br />
                Keberhasilan
                <br />
                <span className="text-blue-400">IPO</span>
                <span className="text-white"> dengan</span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Machine Learning
                </span>
              </h1>

              {/* Deskripsi */}
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-lg">
                Platform prediksi keberhasilan Initial Public Offering (IPO)
                berbasis Logistic Regression yang membantu investor
                menganalisis performa underwriter berdasarkan data historis
                sehingga proses pengambilan keputusan menjadi lebih cepat,
                objektif, dan akurat.
              </p>

              {/* CTA Button */}
              <button
                onClick={() => navigate("/dashboard")}
                className="inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm sm:text-base font-semibold text-white shadow-lg shadow-blue-700/30 transition hover:scale-105 hover:shadow-blue-600/50 duration-300"
              >
                Mulai Sekarang
                <ArrowRight size={18} />
              </button>

              {/* Feature Icons */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-1">
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-500/20">
                    <BarChart3 className="text-blue-400 w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="mt-1.5 text-white font-semibold text-[10px] sm:text-xs">Analisis</h3>
                  <p className="text-slate-400 text-[8px] sm:text-[10px]">Data IPO</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl bg-purple-600/20 flex items-center justify-center border border-purple-500/20">
                    <BrainCircuit className="text-purple-400 w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="mt-1.5 text-white font-semibold text-[10px] sm:text-xs">ML</h3>
                  <p className="text-slate-400 text-[8px] sm:text-[10px]">Logistic Regression</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto rounded-xl bg-cyan-600/20 flex items-center justify-center border border-cyan-500/20">
                    <TrendingUp className="text-cyan-400 w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="mt-1.5 text-white font-semibold text-[10px] sm:text-xs">Prediksi</h3>
                  <p className="text-slate-400 text-[8px] sm:text-[10px]">Cepat & Akurat</p>
                </div>
              </div>
            </div>

            {/* RIGHT IMAGE */}
            <div className="relative flex justify-center lg:justify-end mt-4 lg:mt-0">
              <img
                src={heroImage}
                alt="IPO Hero"
                className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg drop-shadow-[0_15px_60px_rgba(80,100,255,.40)] animate-pulse"
              />
            </div>
          </div>
        </div>

        {/* SCROLL INDICATOR */}
        <button
          onClick={handleScrollDown}
          className="absolute bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-400 hover:text-blue-400 transition-colors duration-300 group cursor-pointer"
          aria-label="Ke Dashboard"
        >
          <span className="text-[8px] sm:text-[10px] tracking-widest uppercase font-medium group-hover:text-blue-400 transition-colors">
            Mulai
          </span>
          <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-bounce group-hover:scale-110 transition-transform" />
        </button>
      </section>
    </div>
  );
}