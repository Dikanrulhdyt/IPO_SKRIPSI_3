from flask import Flask, request, jsonify
import joblib
import json
import numpy as np
import pandas as pd
import os
from datetime import datetime
import pymysql
from dotenv import load_dotenv
from config import MODEL_PATH, UW_STATS_PATH, MAPPING_PATH

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Load artifacts
model = joblib.load(MODEL_PATH)
with open(UW_STATS_PATH, 'r') as f:
    uw_stats = json.load(f)
with open(MAPPING_PATH, 'r') as f:
    ir_mapping = json.load(f)

# Metadata
metadata_path = os.path.join(os.path.dirname(MODEL_PATH), 'model_metadata.json')
with open(metadata_path, 'r') as f:
    metadata = json.load(f)
coefficients = metadata['coefficients']
feature_names = metadata['features']
intercept = metadata['intercept']

# Percentiles untuk size_category (hanya untuk response)
percentiles = metadata.get('percentiles', {})
P33 = percentiles.get('p33', 150_000_000_000)
P66 = percentiles.get('p66', 500_000_000_000)

# ========== DATABASE CONNECTION ==========
def get_db_connection():
    try:
        conn = pymysql.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', ''),
            database=os.getenv('DB_NAME', 'ipo_prediction_system2'),
            port=int(os.getenv('DB_PORT', 3306)),
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        return conn
    except Exception as e:
        print(f"❌ Gagal koneksi ke database: {e}")
        return None

def ensure_table_exists():
    """Buat tabel prediksi_ipo tanpa kolom market_cap"""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        if conn is None:
            print("❌ Tidak dapat membuat tabel: koneksi database gagal")
            return False
        cursor = conn.cursor()
        
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS prediksi_ipo (
                id_prediksi INT AUTO_INCREMENT PRIMARY KEY,
                nama_emiten VARCHAR(255) NOT NULL,
                tanggal_prediksi DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                underwriter_ids TEXT,
                harga_ipo DECIMAL(15,2) NOT NULL,
                jumlah_lot BIGINT NOT NULL,
                free_float DECIMAL(5,2) NOT NULL,
                sektor_id INT NOT NULL,
                prob_sukses DECIMAL(5,4) NOT NULL,
                prediksi_label ENUM('SUKSES', 'TIDAK SUKSES') NOT NULL,
                estimasi_initial_return DECIMAL(8,4),
                peringatan_bubble TEXT,
                total_dana_dihimpun BIGINT,
                kategori VARCHAR(50),
                FOREIGN KEY (sektor_id) REFERENCES sektor(sektor_id) ON DELETE CASCADE
            )
        """)
        conn.commit()
        print("✅ Tabel prediksi_ipo siap (tanpa market_cap)")
        return True
    except Exception as e:
        print(f"⚠️ Error creating table: {e}")
        if conn:
            conn.rollback()
        return False
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# ========== SAVE PREDICTION (Tanpa Market Cap) ==========
def save_prediction_to_db(data, prob, prediksi_label, estimasi_ir, kategori, warning, total_dana):
    """Menyimpan hasil prediksi tanpa kolom market_cap"""
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        if conn is None:
            print("❌ Tidak dapat menyimpan prediksi: koneksi database gagal")
            return False
        
        cursor = conn.cursor()
        
        # Cari atau buat sektor
        sektor_nama = data.get('sektor', 'Unknown')
        cursor.execute("SELECT sektor_id FROM sektor WHERE nama_sektor = %s", (sektor_nama,))
        result = cursor.fetchone()
        if result:
            sektor_id = result['sektor_id']
        else:
            cursor.execute("INSERT INTO sektor (nama_sektor) VALUES (%s)", (sektor_nama,))
            conn.commit()
            sektor_id = cursor.lastrowid
            print(f"✅ Sektor baru dibuat: {sektor_nama} (ID: {sektor_id})")
        
        # INSERT tanpa market_cap
        sql = """
        INSERT INTO prediksi_ipo (
            nama_emiten, tanggal_prediksi, underwriter_ids, harga_ipo, 
            jumlah_lot, free_float, sektor_id, prob_sukses, 
            prediksi_label, estimasi_initial_return, peringatan_bubble, 
            total_dana_dihimpun, kategori
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s
        )
        """
        vals = (
            data.get('nama_emiten', 'IPO Baru'),
            datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            json.dumps(data.get('underwriter_ids', [])),
            float(data.get('harga_ipo', 0)),
            float(data.get('jumlah_lot', 0)),
            float(data.get('free_float', 0)),
            sektor_id,
            float(prob),
            prediksi_label,
            float(estimasi_ir) if estimasi_ir else None,
            warning if warning else None,
            float(total_dana) if total_dana else None,
            kategori
        )
        
        cursor.execute(sql, vals)
        conn.commit()
        print(f"✅ Prediksi berhasil disimpan ke database (ID: {cursor.lastrowid})")
        return True
        
    except Exception as e:
        print(f"❌ Gagal menyimpan prediksi ke database: {e}")
        if conn:
            conn.rollback()
        return False
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

# ========== UTILITY FUNCTIONS ==========
def get_uw_features(underwriter_ids):
    if not underwriter_ids:
        return 0.0, 0, 0.0
    avg_returns = []
    total_ipo = 0
    success_rates = []
    for uid in underwriter_ids:
        stats = uw_stats.get(uid)
        if stats:
            avg_returns.append(stats['avg_return'])
            total_ipo += stats['jumlah_ipo']
            success_rates.append(stats['success_rate'])
        else:
            # UW baru tidak ditemukan -> netral (0)
            avg_returns.append(0.0)
            success_rates.append(0.0)
    avg_return = np.mean(avg_returns) if avg_returns else 0.0
    success_rate = np.mean(success_rates) if success_rates else 0.0
    return avg_return, total_ipo, success_rate

def estimate_ir_from_prob(prob):
    for m in ir_mapping:
        if m['prob_min'] <= prob < m['prob_max']:
            return m['mean_ir']
    return ir_mapping[-1]['mean_ir']

def get_auto_rejection_limit(harga_ipo):
    if harga_ipo <= 200:
        return 0.35
    elif harga_ipo <= 5000:
        return 0.25
    else:
        return 0.20

def get_bubble_warning(estimasi_ir, harga_ipo):
    limit = get_auto_rejection_limit(harga_ipo)
    if estimasi_ir > limit:
        return f"⚠️ Potensi bubble: estimasi initial return {estimasi_ir:.1%} melebihi batas auto rejection {limit:.0%} untuk harga Rp{harga_ipo:,.0f}"
    elif estimasi_ir > 0.30:
        return "⚡ Sukses tinggi (di atas rata-rata pasar)"
    else:
        return "Normal"

def get_kategori(prob):
    if prob >= 0.8:
        return "Sangat Menarik"
    elif prob >= 0.6:
        return "Menarik"
    elif prob >= 0.4:
        return "Netral"
    else:
        return "Berisiko"

def get_size_category(market_cap, p33=P33, p66=P66):
    if market_cap <= p33:
        return "Kecil"
    elif market_cap <= p66:
        return "Sedang"
    else:
        return "Besar"

# ========== ENDPOINT PREDICT ==========
@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        print("=" * 50)
        print("📥 Received prediction request:")
        print(json.dumps(data, indent=2, default=str))
        print("=" * 50)
        
        underwriter_ids = data.get('underwriter_ids', [])
        harga_ipo = data.get('harga_ipo')
        jumlah_lot = data.get('jumlah_lot')
        free_float = data.get('free_float')
        sektor = data.get('sektor')
        nama_emiten = data.get('nama_emiten', 'IPO Baru')
        
        if None in [harga_ipo, jumlah_lot, free_float, sektor]:
            return jsonify({'error': 'Missing fields (harga_ipo, jumlah_lot, free_float, sektor)'}), 400
        
        # Hitung total dana dan market cap (hanya untuk response)
        total_dana = harga_ipo * jumlah_lot * 100
        if free_float and free_float > 0:
            market_cap = total_dana / (free_float / 100)
        else:
            market_cap = total_dana
        
        size_category = get_size_category(market_cap)
        
        # Fitur underwriter (agregat)
        uw_avg_return, uw_jumlah_ipo, uw_success_rate = get_uw_features(underwriter_ids)
        num_underwriters = len(underwriter_ids)
        
        # 🔥 DETAIL PER UNDERWRITER (untuk frontend)
        underwriter_details = []
        for uid in underwriter_ids:
            stats = uw_stats.get(uid)
            if stats:
                underwriter_details.append({
                    'underwriter_id': uid,
                    'avg_return': stats.get('avg_return', 0.0),
                    'jumlah_ipo': stats.get('jumlah_ipo', 0),
                    'success_rate': stats.get('success_rate', 0.0)
                })
            else:
                underwriter_details.append({
                    'underwriter_id': uid,
                    'avg_return': 0.0,
                    'jumlah_ipo': 0,
                    'success_rate': 0.0
                })
        
        # Input untuk model
        input_data = pd.DataFrame([{
            'uw_avg_return': uw_avg_return,
            'uw_jumlah_ipo': uw_jumlah_ipo,
            'uw_success_rate': uw_success_rate,
            'total_dana_dihimpun': total_dana,
            'free_float': free_float,
            'num_underwriters': num_underwriters,
            'sektor': sektor
        }])
        
        print(f"📊 Input data untuk model:")
        print(input_data.to_string())
        
        # Prediksi
        prob = model.predict_proba(input_data)[0][1]
        prediksi = 'SUKSES' if prob > 0.5 else 'TIDAK SUKSES'
        estimasi_ir = estimate_ir_from_prob(prob)
        kategori = get_kategori(prob)
        warning = get_bubble_warning(estimasi_ir, harga_ipo)
        
        # Kontribusi fitur
        preprocessor = model.named_steps['preprocessor']
        classifier = model.named_steps['classifier']
        X_scaled = preprocessor.transform(input_data)
        coefs = classifier.coef_[0]
        
        contributions = {}
        for i, name in enumerate(feature_names):
            contrib = coefs[i] * X_scaled[0][i]
            contributions[name] = float(contrib)
        
        abs_sum = sum(abs(v) for v in contributions.values())
        contrib_percent = {k: (v / abs_sum) * 100 for k, v in contributions.items()} if abs_sum > 0 else {k: 0 for k in contributions}
        
        # Pastikan tabel ada
        ensure_table_exists()
        
        # Simpan ke database
        save_prediction_to_db(
            data=data,
            prob=prob,
            prediksi_label=prediksi,
            estimasi_ir=estimasi_ir,
            kategori=kategori,
            warning=warning,
            total_dana=total_dana
        )
        
        # ===== RESPONSE DENGAN TAMBAHAN INPUT & DETAIL UW =====
        return jsonify({
            # Prediksi utama
            'nama_emiten': data.get('nama_emiten', 'IPO Baru'),
            'probabilitas_sukses': round(prob, 4),
            'prediksi': prediksi,
            'kategori': kategori,
            'estimasi_initial_return': round(estimasi_ir, 4),
            'bubble_warning': warning,
            
            # Input yang dikirim user
            'harga_ipo': float(harga_ipo),
            'jumlah_lot': int(jumlah_lot),
            'free_float': float(free_float),
            'sektor': sektor,
            
            # Statistik underwriter agregat
            'underwriter_avg_return': round(uw_avg_return, 4),
            'underwriter_jumlah_ipo': uw_jumlah_ipo,
            'underwriter_success_rate': round(uw_success_rate, 4),
            'num_underwriters': num_underwriters,
            
            # Detail per underwriter (baru)
            'underwriter_details': underwriter_details,
            
            # Dana & market cap
            'total_dana_dihimpun': int(total_dana),
            'market_cap': int(market_cap),
            'market_cap_miliar': round(market_cap / 1e9, 2),
            'size_category': size_category,
            
            # Kontribusi faktor
            'faktor_kontribusi': contrib_percent
        })
        
    except Exception as e:
        print(f"❌ Error in predict: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# ========== ENDPOINT UW_STATS ==========
@app.route('/uw_stats', methods=['GET'])
def uw_stats_endpoint():
    return jsonify(uw_stats)

# ========== MAIN ==========
if __name__ == '__main__':
    print("🔧 Memastikan tabel prediksi_ipo ada...")
    ensure_table_exists()
    print("🚀 Starting ML Service on port 5001...")
    app.run(host='0.0.0.0', port=5001, debug=True)