from flask import Flask, render_template, jsonify
import requests

app = Flask(__name__)

FIREBASE_DATABASE_URL = "https://suhu-monitoring-5ec3b-default-rtdb.asia-southeast1.firebasedatabase.app"
TEMP_IDEAL_MIN = 20.0
TEMP_IDEAL_MAX = 28.0

def get_status(temp):
    if temp < TEMP_IDEAL_MIN:
        return {"message": "Terlalu Dingin (Perlu Pemanasan)", "color": "blue"}
    elif temp > TEMP_IDEAL_MAX:
        return {"message": "Terlalu Panas (Perlu Pendinginan)", "color": "red"}
    else:
        return {"message": "Suhu Ideal (Nyaman)", "color": "green"}

def get_sensor_data():
    try:
        response = requests.get(f"{FIREBASE_DATABASE_URL}/sensor.json", timeout=5)
        if response.status_code == 200:
            data = response.json()
            if data:
                temp = data.get('temp', 0.0)
                status = get_status(temp)
                return {
                    "temp": temp,
                    "hum": data.get('hum', 0.0),
                    "last_update": data.get('last_update', '--:--:--'),
                    "status_message": status["message"],
                    "status_color": status["color"]
                }
    except Exception as e:
        print(f"Error: {e}")
    
    return {
        "temp": 0.0, "hum": 0.0, "last_update": "--:--:--",
        "status_message": "Menunggu data dari ESP32...", "status_color": "gray"
    }

@app.route('/')
def index():
    return render_template('index.html', **get_sensor_data())

@app.route('/api/data')
def get_data():
    return jsonify(get_sensor_data())

if __name__ == '__main__':
    print("Flask server running on http://0.0.0.0:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
