import pandas as pd
import numpy as np
from tqdm import tqdm
import os
import json
from services.ipo_service import df, split_underwriters
from services.yfinance_service import get_day1_close
from utils.helper import ambil_tanggal, hitung_return

ML_DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml-service", "data")
os.makedirs(ML_DATA_DIR, exist_ok=True)
OUTPUT_CSV = os.path.join(ML_DATA_DIR, "data_ipo_ready.csv")
UW_STATS_JSON = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ml-service", "model", "underwriter_stats.json")
os.makedirs(os.path.dirname(UW_STATS_JSON), exist_ok=True)

def clean_underwriter_ids(uw_ids):
    """Pastikan underwriter_ids menjadi JSON string yang valid (satu lapis)"""
    if not uw_ids:
        return '[]'
    if isinstance(uw_ids, list):
        cleaned = [str(u).strip().upper() for u in uw_ids if u]
        return json.dumps(cleaned)
    if isinstance(uw_ids, str):
        # Coba parse jika sudah JSON
        try:
            parsed = json.loads(uw_ids)
            if isinstance(parsed, list):
                cleaned = [str(u).strip().upper() for u in parsed if u]
                return json.dumps(cleaned)
            elif isinstance(parsed, str):
                # Escape berlapis, coba parse lagi
                try:
                    parsed2 = json.loads(parsed)
                    if isinstance(parsed2, list):
                        cleaned = [str(u).strip().upper() for u in parsed2 if u]
                        return json.dumps(cleaned)
                except:
                    pass
        except:
            pass
        # Fallback: split pipe
        cleaned = [u.strip().upper() for u in uw_ids.split('|') if u.strip()]
        return json.dumps(cleaned)
    return '[]'

def main():
    print("="*70)
    print("📊 MEMBANGUN DATASET BERLABEL (FIXED - RANS & PRDL)")
    print("="*70)
    
    print(f"Kolom yang tersedia: {df.columns.tolist()}")
    if 'nama_emiten' not in df.columns:
        print("⚠️ Kolom 'nama_emiten' tidak ditemukan! Gunakan fallback.")
        df['nama_emiten'] = df['kode_emiten']
    
    # Debug untuk RANS
    rans_row = df[df['kode_emiten'] == 'RANS']
    if not rans_row.empty:
        print("\n🔍 [DEBUG] Data RANS dari database:")
        print(rans_row.to_dict('records')[0])
    
    rows = []
    failed_tickers = []
    debug_tickers = ['RANS', 'PRDL', 'EMMI', 'BACH']
    
    for _, row in tqdm(df.iterrows(), total=len(df), desc="Fetching close_day1"):
        ticker = row.get("kode_emiten")
        if not ticker:
            continue
            
        tanggal_str = row.get("tahun_ipo")
        tanggal = ambil_tanggal(tanggal_str)
        if tanggal is None:
            print(f"[WARN] Tanggal invalid untuk {ticker}: {tanggal_str}")
            continue
            
        harga_ipo = row.get("harga_ipo")
        if pd.isna(harga_ipo) or harga_ipo == 0:
            print(f"[WARN] Harga IPO invalid untuk {ticker}")
            continue
        
        close_day1 = get_day1_close(ticker, tanggal)
        if close_day1 is None:
            print(f"[WARN] Tidak bisa ambil close_day1 untuk {ticker} pada {tanggal}")
            failed_tickers.append(ticker)
            initial_return = None
        else:
            initial_return = hitung_return(harga_ipo, close_day1)
            if initial_return is None:
                print(f"[WARN] Return tidak bisa dihitung untuk {ticker}")
        
        # ===== DEBUG KHUSUS UNTUK DATA BARU =====
        if ticker in debug_tickers:
            print(f"\n🔍 [DEBUG] {ticker}:")
            print(f"   harga_ipo = {harga_ipo}")
            print(f"   close_day1 = {close_day1}")
            print(f"   initial_return = {initial_return}")
            print(f"   initial_return type = {type(initial_return)}")
        
        nama_emiten = row.get("nama_emiten")
        if pd.isna(nama_emiten) or str(nama_emiten).strip() == '':
            nama_emiten = ticker
        
        # ===== PERBAIKAN UTAMA: Bersihkan underwriter_ids =====
        uw_raw = row.get("underwriter")
        uw_ids = split_underwriters(uw_raw)
        num_uw = len(uw_ids)
        db_num_uw = row.get("num_underwriters", 0)
        if pd.isna(db_num_uw) or db_num_uw == 0:
            num_uw = len(uw_ids)
        else:
            num_uw = int(db_num_uw)
        
        if ticker in debug_tickers:
            print(f"   uw_raw = {uw_raw}")
            print(f"   uw_ids setelah split = {uw_ids}")
            print(f"   num_uw = {num_uw}")
        
        uw_ids_clean = clean_underwriter_ids(uw_ids)
        
        if ticker in debug_tickers:
            print(f"   uw_ids_clean = {uw_ids_clean}")
        
        lot = float(row.get("jumlah_lot_saham", 0)) if pd.notna(row.get("jumlah_lot_saham")) else 0
        free_float = float(row.get("free_float", 0)) if pd.notna(row.get("free_float")) else 0
        
        total_dana = harga_ipo * lot * 100 * (free_float / 100) if lot > 0 else 0
        market_cap = harga_ipo * lot * 100 if lot > 0 else 0
        
        rows.append({
            "kode_emiten": ticker,
            "nama_emiten": str(nama_emiten),
            "tanggal": tanggal,
            "harga_ipo": float(harga_ipo),
            "close_day1": close_day1,
            "initial_return": initial_return,
            "underwriter_raw": uw_raw,
            "underwriter_ids": uw_ids_clean,
            "num_underwriters": num_uw,
            "jumlah_lot_saham": lot,
            "free_float": free_float,
            "sektor": row.get("sektor") if pd.notna(row.get("sektor")) else "Unknown",
            "total_dana_dihimpun": total_dana,
            "market_cap": market_cap
        })
    
    if failed_tickers:
        print(f"⚠️ Gagal mengambil close_day1 untuk ticker: {', '.join(failed_tickers)}")
    
    df_returns = pd.DataFrame(rows)
    print(f"\n✅ Total data dengan return valid: {len(df_returns)}")
    if len(df_returns) > 0:
        print(f"   Contoh nama emiten: {df_returns['nama_emiten'].iloc[0]}")
        
        # ===== CEK DATA RANS DI DATAFRAME =====
        for ticker in debug_tickers:
            mask = df_returns['kode_emiten'] == ticker
            if mask.any():
                row_data = df_returns[mask].iloc[0]
                print(f"\n🔍 [DEBUG] {ticker} di dataframe:")
                print(f"   initial_return = {row_data['initial_return']}")
                print(f"   underwriter_ids = {row_data['underwriter_ids']}")
                print(f"   total_dana_dihimpun = {row_data['total_dana_dihimpun']}")
                print(f"   market_cap = {row_data['market_cap']}")
    
    # --- Statistik UW ---
    # Buat kolom sementara untuk explode
    df_returns['_uw_list'] = df_returns['underwriter_ids'].apply(lambda x: json.loads(x) if x else [])
    expanded = df_returns.explode('_uw_list')
    expanded = expanded[expanded['_uw_list'].notna()]
    expanded = expanded[expanded['_uw_list'] != '']
    
    if not expanded.empty:
        uw_stats = expanded.groupby('_uw_list').agg(
            jumlah_ipo=("initial_return", "count"),
            avg_return=("initial_return", "mean")
        ).reset_index()
        uw_stats.columns = ['underwriter_ids', 'jumlah_ipo', 'avg_return']
        uw_stats["success_rate"] = expanded.groupby('_uw_list')["initial_return"].apply(
            lambda x: (x > 0).mean()
        ).values
        uw_stats_dict = uw_stats.set_index("underwriter_ids").to_dict(orient="index")
    else:
        uw_stats_dict = {}
    
    with open(UW_STATS_JSON, "w") as f:
        json.dump(uw_stats_dict, f, indent=2)
    print(f"✅ Statistik {len(uw_stats_dict)} underwriter disimpan")
    
    # Agregat UW per baris
    def get_uw_features(uw_ids_str):
        try:
            uw_ids = json.loads(uw_ids_str) if uw_ids_str else []
        except:
            uw_ids = []
        if not uw_ids:
            return {"avg_return": 0, "jumlah_ipo": 0, "success_rate": 0}
        avg_returns = []
        total_ipo = 0
        success_rates = []
        for uid in uw_ids:
            stats = uw_stats_dict.get(uid)
            if stats:
                avg_returns.append(stats["avg_return"])
                total_ipo += stats["jumlah_ipo"]
                success_rates.append(stats["success_rate"])
        return {
            "avg_return": np.mean(avg_returns) if avg_returns else 0,
            "jumlah_ipo": total_ipo,
            "success_rate": np.mean(success_rates) if success_rates else 0
        }
    
    df_returns["uw_avg_return"] = df_returns["underwriter_ids"].apply(lambda x: get_uw_features(x)["avg_return"])
    df_returns["uw_jumlah_ipo"] = df_returns["underwriter_ids"].apply(lambda x: get_uw_features(x)["jumlah_ipo"])
    df_returns["uw_success_rate"] = df_returns["underwriter_ids"].apply(lambda x: get_uw_features(x)["success_rate"])
    
    # Label
    df_returns["label"] = df_returns["initial_return"].apply(
        lambda x: 1 if x is not None and x > 0 else (0 if x is not None else None)
    )
    
    # Size category
    market_cap_values = df_returns["market_cap"].dropna()
    p33 = market_cap_values.quantile(0.33) if len(market_cap_values) > 0 else 0
    p66 = market_cap_values.quantile(0.66) if len(market_cap_values) > 0 else 0
    print(f"📊 Market Cap P33: {p33:,.0f}, P66: {p66:,.0f}")
    
    def get_size_category(mc):
        if mc <= p33:
            return "Kecil"
        elif mc <= p66:
            return "Sedang"
        else:
            return "Besar"
    
    df_returns["size_category"] = df_returns["market_cap"].apply(
        lambda x: get_size_category(x) if x and x > 0 else "Kecil"
    )
    
    # Pilih kolom
    df_final = df_returns[[
        "kode_emiten", "nama_emiten", "tanggal", "underwriter_ids", "num_underwriters",
        "uw_avg_return", "uw_jumlah_ipo", "uw_success_rate",
        "harga_ipo", "jumlah_lot_saham", "free_float",
        "total_dana_dihimpun", "market_cap", "size_category",
        "sektor", "label", "initial_return"
    ]].copy()
    
    df_final.drop(columns=['_uw_list'], errors='ignore', inplace=True)
    
    df_final.to_csv(OUTPUT_CSV, index=False)
    print(f"✅ Dataset siap training disimpan ke {OUTPUT_CSV}")
    print(f"   Dimensi: {df_final.shape}")
    
    # ===== CEK DATA RANS DI CSV FINAL =====
    for ticker in debug_tickers:
        mask = df_final['kode_emiten'] == ticker
        if mask.any():
            row_data = df_final[mask].iloc[0]
            print(f"\n🔍 [DEBUG] {ticker} di CSV FINAL:")
            print(f"   initial_return = {row_data['initial_return']}")
            print(f"   label = {row_data['label']}")
            print(f"   underwriter_ids = {row_data['underwriter_ids']}")
            print(f"   total_dana_dihimpun = {row_data['total_dana_dihimpun']}")
            print(f"   market_cap = {row_data['market_cap']}")
    
    print(f"   Distribusi label:\n{df_final['label'].value_counts(dropna=False)}")

    # ============================================================
    # 🔥 TAMBAHAN: UPDATE DATABASE DENGAN HASIL GENERATE_DATASET
    # ============================================================
    try:
        import pymysql
        from dotenv import load_dotenv
        load_dotenv()
        
        conn = pymysql.connect(
            host=os.getenv('DB_HOST', 'localhost'),
            user=os.getenv('DB_USER', 'root'),
            password=os.getenv('DB_PASSWORD', ''),
            database=os.getenv('DB_NAME', 'ipo_prediction_system2'),
            port=int(os.getenv('DB_PORT', 3306)),
            charset='utf8mb4'
        )
        cursor = conn.cursor()
        
        updated = 0
        for _, row in df_final.iterrows():
            if pd.notna(row['initial_return']):
                status_sukses = 1 if row['initial_return'] > 0 else 0
                cursor.execute(
                    """UPDATE ipo 
                       SET initial_return = %s, 
                           total_dana_dihimpun = %s, 
                           market_cap = %s,
                           status_sukses = %s
                       WHERE kode_emiten = %s""",
                    (float(row['initial_return']), 
                     float(row['total_dana_dihimpun']), 
                     float(row['market_cap']),
                     status_sukses,
                     row['kode_emiten'])
                )
                updated += cursor.rowcount
        
        conn.commit()
        cursor.close()
        conn.close()
        print(f"\n✅ Database updated: {updated} rows with initial_return, total_dana, market_cap, status_sukses")
        
        # ===== CEK KHUSUS RANS =====
        if 'RANS' in df_final['kode_emiten'].values:
            rans_data = df_final[df_final['kode_emiten'] == 'RANS'].iloc[0]
            print(f"🔍 [DEBUG] RANS setelah update DB: initial_return = {rans_data['initial_return']}, status_sukses = {1 if rans_data['initial_return'] > 0 else 0}")
    except ImportError as e:
        print(f"\n⚠️ Library tidak ditemukan: {e}. Database tidak diupdate.")
        print("   Install dengan: pip install pymysql python-dotenv")
    except Exception as e:
        print(f"\n⚠️ Gagal update database: {e}")
        print("   Pastikan database running dan kredensial benar.")

if __name__ == "__main__":
    main()