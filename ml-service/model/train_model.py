import pandas as pd
import numpy as np
import joblib
import json
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from config import DATA_PATH, MODEL_PATH, UW_STATS_PATH, MAPPING_PATH
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, roc_auc_score

def main():
    print("="*70)
    print("🚀 TRAINING REGRESI LOGISTIK (Fitur: total_dana_dihimpun, UW stats, free_float, num_uw, sektor)")
    print("="*70)
    
    df = pd.read_csv(DATA_PATH)
    print(f"📂 Dataset: {df.shape[0]} baris, {df.shape[1]} kolom")
    
    # FITUR NUMERIK: total_dana_dihimpun menggantikan harga_ipo + jumlah_lot
    numeric_features = [
        "uw_avg_return", "uw_jumlah_ipo", "uw_success_rate",
        "total_dana_dihimpun",
        "free_float",
        "num_underwriters"
    ]
    categorical_features = ["sektor"]
    
    X = df[numeric_features + categorical_features]
    y = df["label"]
    ir_actual = df["initial_return"]
    
    print(f"Distribusi label:\n{y.value_counts()}")
    print(f"Fitur numerik: {numeric_features}")
    
    X_train, X_test, y_train, y_test, ir_train, ir_test = train_test_split(
        X, y, ir_actual, test_size=0.2, random_state=42, stratify=y
    )
    print(f"Training: {X_train.shape[0]} data | Testing: {X_test.shape[0]} data")
    
    # Preprocessor
    preprocessor = ColumnTransformer([
        ('num', StandardScaler(), numeric_features),
        ('cat', OneHotEncoder(drop='first', sparse_output=False), categorical_features)
    ])
    
    model = Pipeline([
        ('preprocessor', preprocessor),
        ('classifier', LogisticRegression(class_weight='balanced', random_state=42, max_iter=1000, C=0.1))
    ])
    
    model.fit(X_train, y_train)
    
    # Transform test data untuk evaluasi
    X_test_scaled = model.named_steps['preprocessor'].transform(X_test)
    
    # Evaluasi testing
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)
    
    # AUC-ROC
    y_prob = model.predict_proba(X_test)[:, 1]
    auc = roc_auc_score(y_test, y_prob)
    
    print("\n📊 EVALUASI TESTING SET (20% data):")
    print(f"Accuracy : {acc:.2%}")
    print(f"Precision: {prec:.2%}")
    print(f"Recall   : {rec:.2%}")
    print(f"F1-Score : {f1:.2%}")
    print(f"AUC-ROC  : {auc:.2%}")
    print("Confusion Matrix:")
    print(cm)
    
    # Kalibrasi
    prob_train = model.predict_proba(X_train)[:, 1]
    bins = np.linspace(0, 1, 11)
    ir_mapping = []
    for i in range(len(bins)-1):
        mask = (prob_train >= bins[i]) & (prob_train < bins[i+1])
        mean_ir = ir_train[mask].mean() if mask.any() else 0.0
        ir_mapping.append({'prob_min': bins[i], 'prob_max': bins[i+1], 'mean_ir': mean_ir})
    
    with open(MAPPING_PATH, 'w') as f:
        json.dump(ir_mapping, f, indent=2)
    print(f"\n✅ Mapping prob -> IR disimpan ke {MAPPING_PATH}")
    
    joblib.dump(model, MODEL_PATH)
    print(f"✅ Model disimpan ke {MODEL_PATH}")
    
    # Metadata
    logreg = model.named_steps['classifier']
    preprocessor_obj = model.named_steps['preprocessor']
    
    feature_names = numeric_features.copy()
    cat_encoder = preprocessor_obj.named_transformers_['cat']
    if hasattr(cat_encoder, 'get_feature_names_out'):
        cat_feature_names = cat_encoder.get_feature_names_out(categorical_features).tolist()
    else:
        cat_feature_names = [f"{cat}_{val}" for cat in categorical_features for val in cat_encoder.categories_[0][1:]]
    feature_names.extend(cat_feature_names)
    
    coefs = logreg.coef_[0]
    intercept = logreg.intercept_[0]
    
    metadata = {
        'model': 'Logistic Regression',
        'features': feature_names,
        'coefficients': {name: float(coef) for name, coef in zip(feature_names, coefs)},
        'intercept': float(intercept),
        'evaluation': {
            'accuracy': acc,
            'precision': prec,
            'recall': rec,
            'f1': f1,
            'confusion_matrix': cm.tolist(),
            'auc_roc': auc
        },
        'threshold': '0% (initial return > 0%)',
        'calibration_bins': ir_mapping
    }
    
    metadata_path = os.path.join(os.path.dirname(MODEL_PATH), 'model_metadata.json')
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    print(f"✅ Metadata disimpan ke {metadata_path}")

if __name__ == "__main__":
    main()