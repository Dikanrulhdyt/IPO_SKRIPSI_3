import os

BASE_DIR = os.path.dirname(__file__)

# Path file CSV (masih digunakan untuk underwriter master, atau nanti juga dari DB)
DATA_IPO = os.path.join(BASE_DIR, "data", "data_ipo.csv")
DATA_UW = os.path.join(BASE_DIR, "data", "underwriter_master.csv")
CACHE_DIR = os.path.join(BASE_DIR, "cache")
os.makedirs(CACHE_DIR, exist_ok=True)

# Konfigurasi Database MySQL
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")  # isi password Anda
DB_NAME = os.getenv("DB_NAME", "ipo_prediction_system2")
DB_PORT = os.getenv("DB_PORT", "3306")

# Connection string untuk SQLAlchemy
DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"