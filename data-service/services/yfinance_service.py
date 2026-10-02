import yfinance as yf
import pandas as pd
import os
from config import CACHE_DIR

def get_day1_close(ticker, ipo_date):
    try:
        if not ticker or pd.isna(ticker) or ipo_date is None:
            print(f"[YF] Invalid input for {ticker}")
            return None

        cache_file = os.path.join(CACHE_DIR, f"{ticker}_{ipo_date.date()}.csv")
        if os.path.exists(cache_file):
            df_cache = pd.read_csv(cache_file)
            if not df_cache.empty:
                result = float(df_cache.iloc[0, 0])
                print(f"[YF] Cache hit for {ticker}: {result}")
                return result

        symbol = f"{ticker}.JK"
        print(f"[YF] Fetching {symbol} from {ipo_date} + 10 days...")
        data = yf.download(
            symbol,
            start=ipo_date,
            end=ipo_date + pd.Timedelta(days=10),
            progress=False,
            auto_adjust=False
        )
        if data.empty:
            print(f"[YF] No data for {symbol}")
            return None
        close = data["Close"].dropna()
        if close.empty:
            print(f"[YF] No close price for {symbol}")
            return None
        result = float(close.iloc[0].item())
        print(f"[YF] Success for {ticker}: close={result}")
        pd.DataFrame([result]).to_csv(cache_file, index=False, header=False)
        return result
    except Exception as e:
        print(f"[YF] Error for {ticker}: {e}")
        return None