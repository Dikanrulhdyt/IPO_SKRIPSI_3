import hero from "../../assets/images/hero-ipo.png";

export default function Hero() {
  return (
    <section className="hero">

      <div className="hero-left">

        <span className="badge">
          DATA • ANALISIS • PREDIKSI
        </span>

        <h1>
          Prediksi Keberhasilan
          <br />
          <span>IPO</span> dengan Analisis
          <br />
          Data & Machine Learning
        </h1>

        <p>
          Platform prediksi IPO berbasis Logistic Regression
          untuk membantu investor melakukan analisis
          berdasarkan Kinerja Underwriter.
        </p>

        <button>
          Mulai Sekarang
        </button>

        <div className="feature-list">

          <div>
            📈
            <h4>Analisis Data</h4>
          </div>

          <div>
            🧠
            <h4>Machine Learning</h4>
          </div>

          <div>
            🚀
            <h4>Prediksi Cepat</h4>
          </div>

        </div>

      </div>

      <div className="hero-right">
        <img src={hero} alt="IPO Hero"/>
      </div>

    </section>
  );
}