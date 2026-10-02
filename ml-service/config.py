import os

BASE_DIR = os.path.dirname(__file__)

DATA_PATH = os.path.join(BASE_DIR, "data", "data_ipo_ready.csv")
MODEL_DIR = os.path.join(BASE_DIR, "model")
os.makedirs(MODEL_DIR, exist_ok=True)

MODEL_PATH = os.path.join(MODEL_DIR, "model.pkl")
UW_STATS_PATH = os.path.join(MODEL_DIR, "underwriter_stats.json")
MAPPING_PATH = os.path.join(MODEL_DIR, "prob_ir_mapping.json")