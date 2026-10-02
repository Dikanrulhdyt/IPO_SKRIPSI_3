import pandas as pd
import json
import re
from config import DATA_IPO, DATA_UW, DATABASE_URL
from sqlalchemy import create_engine, text

# --- Baca Underwriter Master ---
uw_df = pd.read_csv(DATA_UW)
uw_df.columns = uw_df.columns.str.strip().str.lower()
UW_MAP = {str(row["id"]).strip().upper(): row["nama"] for _, row in uw_df.iterrows()}

def split_underwriters(uw_input):
    """
    Menerima input underwriter dalam berbagai format, termasuk escape berlapis.
    Mengembalikan list kode underwriter yang sudah dibersihkan (uppercase).
    """
    if pd.isna(uw_input) or uw_input is None:
        return []
    
    # Jika sudah list, langsung return
    if isinstance(uw_input, list):
        return [str(u).strip().upper() for u in uw_input if u]
    
    if not isinstance(uw_input, str):
        return []
    
    raw = uw_input.strip()
    if not raw:
        return []

    # Fungsi rekursif untuk mengurai JSON berlapis
    def recursive_parse(val, depth=0):
        if depth > 20:  # batas aman
            return val
        
        if isinstance(val, list):
            result = []
            for item in val:
                if isinstance(item, str):
                    # Coba parse jika string terlihat JSON
                    if item.strip().startswith(('"', '[')):
                        try:
                            parsed = json.loads(item)
                            if isinstance(parsed, (list, str)):
                                inner = recursive_parse(parsed, depth+1)
                                if isinstance(inner, list):
                                    result.extend(inner)
                                else:
                                    result.append(str(inner))
                        except:
                            # Bersihkan dari tanda kutip dan backslash
                            clean = re.sub(r'^["\']+|["\']+$', '', item)
                            clean = clean.replace('\\', '')
                            if clean:
                                result.append(clean)
                    else:
                        # String biasa
                        clean = re.sub(r'^["\']+|["\']+$', '', item)
                        clean = clean.replace('\\', '')
                        if clean:
                            result.append(clean)
                else:
                    result.append(str(item))
            return result
        
        elif isinstance(val, str):
            # Jika string, coba parse JSON
            if val.strip().startswith(('"', '[')):
                try:
                    parsed = json.loads(val)
                    return recursive_parse(parsed, depth+1)
                except:
                    # Bukan JSON, split dengan koma
                    if ',' in val:
                        parts = [re.sub(r'^["\']+|["\']+$', '', p).strip().replace('\\', '') for p in val.split(',')]
                        return [p for p in parts if p]
                    else:
                        clean = re.sub(r'^["\']+|["\']+$', '', val)
                        clean = clean.replace('\\', '')
                        return [clean] if clean else []
            else:
                # String biasa, split dengan koma
                if ',' in val:
                    parts = [re.sub(r'^["\']+|["\']+$', '', p).strip().replace('\\', '') for p in val.split(',')]
                    return [p for p in parts if p]
                else:
                    clean = re.sub(r'^["\']+|["\']+$', '', val)
                    clean = clean.replace('\\', '')
                    return [clean] if clean else []
        
        return [str(val)]
    
    try:
        result = recursive_parse(raw)
        # Filter hasil kosong
        cleaned = [str(r).strip().upper() for r in result if r and str(r).strip() != '']
        return cleaned
    except Exception as e:
        print(f"⚠️ Error parsing underwriter '{raw}': {e}")
        # Fallback: split dengan koma
        if ',' in raw:
            parts = [re.sub(r'^["\']+|["\']+$', '', p).strip().upper().replace('\\', '') for p in raw.split(',')]
            return [p for p in parts if p]
        return []

def get_underwriter_names(uw_ids):
    return [UW_MAP.get(uid, f"UNKNOWN_{uid}") for uid in uw_ids]

# --- Fungsi untuk membaca data IPO dari Database ---
def load_ipo_from_db():
    engine = create_engine(DATABASE_URL)
    query = text("""
    SELECT 
        i.kode_emiten,
        i.nama_emiten,
        i.tanggal_ipo as tahun_ipo,
        i.harga_ipo,
        i.jumlah_lot as jumlah_lot_saham,
        i.free_float,
        s.nama_sektor as sektor,
        i.underwriter_ids as underwriter,
        i.num_underwriters
    FROM ipo i
    LEFT JOIN sektor s ON i.sektor_id = s.sektor_id
    """)
    df = pd.read_sql(query, engine)
    df.columns = df.columns.str.strip().str.lower()
    return df

def load_ipo_from_csv():
    df = pd.read_csv(DATA_IPO)
    df.columns = df.columns.str.strip().str.lower()
    if 'nama_perusahaan' in df.columns:
        df['nama_emiten'] = df['nama_perusahaan']
    elif 'nama_emiten' not in df.columns:
        df['nama_emiten'] = df['kode_emiten']
    return df

# --- Pilih sumber data ---
try:
    df = load_ipo_from_db()
    print(f"✅ Data IPO berhasil dimuat dari DATABASE ({len(df)} baris)")
    if len(df) > 0 and 'nama_emiten' in df.columns:
        print(f"   Contoh nama emiten: {df['nama_emiten'].iloc[0]}")
except Exception as e:
    print(f"⚠️ Gagal memuat dari database ({e}), fallback ke CSV")
    df = load_ipo_from_csv()
    print(f"✅ Data IPO berhasil dimuat dari CSV ({len(df)} baris)")