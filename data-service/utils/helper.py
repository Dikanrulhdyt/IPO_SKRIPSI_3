import pandas as pd

def ambil_tanggal(tanggal):
    try:
        return pd.to_datetime(tanggal, dayfirst=True)
    except:
        return None

def hitung_return(harga_ipo, close_day1):
    try:
        if harga_ipo is None or close_day1 is None:
            return None
        return (close_day1 - float(harga_ipo)) / float(harga_ipo)
    except:
        return None