import pandas as pd
import joblib
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from config import DATA_PATH, MODEL_PATH, SCALER_PATH
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

def main():
    print("="*70)
    print("🚀 TRAINING & EVALUASI MODEL REGRESI LOGISTIK")
    print("="*70)
    
    # 1. Load dataset
    df = pd.read_csv(DATA_PATH)
    print(f"📂 Dataset: {df.shape[0]} baris, {df.shape[1]} kolom")
    
    # 2. Pisahkan fitur dan label
    feature_cols = ["uw_avg_return", "uw_jumlah_ipo", "harga_ipo", "jumlah_lot_saham", "free_float"]
    X = df[feature_cols]
    y = df["label"]
    
    print(f"📊 Distribusi label:\n{y.value_counts()}")
    
    # 3. TRAIN-TEST SPLIT (80% train, 20% test) dengan stratify
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"\n🔹 Training set: {X_train.shape[0]} data")
    print(f"🔹 Testing set : {X_test.shape[0]} data")
    
    # 4. Scaling (hanya fit dari data training)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # 5. Training model
    model = LogisticRegression(random_state=42, max_iter=1000, class_weight='balanced')
    model.fit(X_train_scaled, y_train)
    
    # 6. Evaluasi pada DATA TESTING (ini yang penting)
    y_pred = model.predict(X_test_scaled)
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred)
    
    print("\n" + "="*70)
    print("📊 HASIL PENGUJIAN MODEL (Testing Set - 20% data)")
    print("="*70)
    print(f"✅ Accuracy  : {acc:.2%}")
    print(f"✅ Precision : {prec:.2%}")
    print(f"✅ Recall    : {rec:.2%}")
    print(f"✅ F1-Score  : {f1:.2%}")
    print("\n📋 Confusion Matrix:")
    print(f"                 Prediksi")
    print(f"                 Negatif   Positif")
    print(f"   Aktual Negatif   {cm[0,0]}        {cm[0,1]}")
    print(f"   Aktual Positif   {cm[1,0]}        {cm[1,1]}")
    
    # (Opsional) Evaluasi pada data training untuk cek overfitting
    y_pred_train = model.predict(X_train_scaled)
    acc_train = accuracy_score(y_train, y_pred_train)
    print(f"\n📌 Training Accuracy: {acc_train:.2%}")
    if acc_train - acc > 0.1:
        print("⚠️ Terdapat indikasi overfitting (training accuracy jauh lebih tinggi dari testing)")
    else:
        print("✅ Model generalisasi dengan baik (tidak overfitting)")
    
    # 7. Koefisien model (dari model yang dilatih dengan data training)
    print("\n📐 KOEFISIEN MODEL (Logistic Regression)")
    for col, coef in zip(feature_cols, model.coef_[0]):
        print(f"   {col:20s} : {coef:.4f}")
    print(f"   {'Intercept':20s} : {model.intercept_[0]:.4f}")
    
    # 8. Latih ulang model dengan SELURUH DATA untuk produksi
    print("\n" + "="*70)
    print("🔄 Melatih model final dengan seluruh data (100%) untuk produksi")
    print("="*70)
    scaler_final = StandardScaler()
    X_full_scaled = scaler_final.fit_transform(X)
    model_final = LogisticRegression(random_state=42, max_iter=1000)
    model_final.fit(X_full_scaled, y)
    
    # 9. Simpan model dan scaler final
    joblib.dump(model_final, MODEL_PATH)
    joblib.dump(scaler_final, SCALER_PATH)
    print(f"✅ Model final disimpan di: {MODEL_PATH}")
    print(f"✅ Scaler final disimpan di: {SCALER_PATH}")
    
    print("\n🎉 Selesai! Model siap digunakan untuk prediksi.")

if __name__ == "__main__":
    main()