from flask import Flask, render_template, jsonify
import requests
import os

app = Flask(__name__, template_folder='../templates', static_folder='../static')

# --- Konfigurasi Firebase ---
FIREBASE_DATABASE_URL = "https://suhu-monitoring-5ec3b-default-rtdb.asia-southeast1.firebasedatabase.app"

# Konstanta suhu ideal
TEMP_IDEAL_MIN = 20.0
TEMP_IDEAL_MAX = 28.0

def get_status(temp):
    """Update status berdasarkan suhu"""
    if temp < TEMP_IDEAL_MIN:
        return {
            "message": "Terlalu Dingin (Perlu Pemanasan)",
            "color": "blue"
        }
    elif temp > TEMP_IDEAL_MAX:
        return {
            "message": "Terlalu Panas (Perlu Pendinginan)",
            "color": "red"
        }
    else:
        return {
            "message": "Suhu Ideal (Nyaman)",
            "color": "green"
        }

def get_sensor_data():
    """Ambil data sensor dari Firebase"""
    try:
        response = requests.get(f"{FIREBASE_DATABASE_URL}/sensor.json", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            if data:
                temp = data.get('temp', 0.0)
                hum = data.get('hum', 0.0)
                last_update = data.get('last_update', '--:--:--')
                status = get_status(temp)
                
                return {
                    "temp": temp,
                    "hum": hum,
                    "last_update": last_update,
                    "status_message": status["message"],
                    "status_color": status["color"]
                }
    except Exception as e:
        print(f"Error: {e}")
    
    return {
        "temp": 0.0,
        "hum": 0.0,
        "last_update": "--:--:--",
        "status_message": "Menunggu data dari ESP32...",
        "status_color": "gray"
    }

@app.route('/')
def index():
    sensor_data = get_sensor_data()
    return render_template('index.html', **sensor_data)

@app.route('/api/data')
def get_data():
    return jsonify(get_sensor_data())

# Untuk Vercel
app = app
