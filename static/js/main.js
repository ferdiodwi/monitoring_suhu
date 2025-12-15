/**
 * Temperature & Humidity Monitoring Dashboard
 * Real-time data fetching from Flask API
 */

const CONFIG = {
    API_ENDPOINT: '/api/data',
    UPDATE_INTERVAL: 3000,
    TEMP_MAX: 50,
    TEMP_IDEAL_MIN: 20,
    TEMP_IDEAL_MAX: 28
};

const elements = {
    tempValue: document.getElementById('tempValue'),
    humValue: document.getElementById('humValue'),
    tempGauge: document.getElementById('tempGauge'),
    humGauge: document.getElementById('humGauge'),
    lastUpdate: document.getElementById('lastUpdate'),
    statusCard: document.getElementById('statusCard'),
    statusIcon: document.getElementById('statusIcon'),
    statusMessage: document.getElementById('statusMessage'),
    connectionStatus: document.getElementById('connectionStatus')
};

async function fetchSensorData() {
    try {
        const response = await fetch(CONFIG.API_ENDPOINT);
        if (!response.ok) throw new Error('Network error');

        const data = await response.json();
        updateDashboard(data);
        setConnectionStatus(true);
    } catch (error) {
        console.error('Error:', error);
        setConnectionStatus(false);
    }
}

function updateDashboard(data) {
    if (elements.tempValue) {
        animateValue(elements.tempValue, parseFloat(elements.tempValue.textContent) || 0, data.temp, 500);
    }
    if (elements.humValue) {
        animateValue(elements.humValue, parseFloat(elements.humValue.textContent) || 0, data.hum, 500);
    }

    updateGauge(elements.tempGauge, data.temp, CONFIG.TEMP_MAX);
    updateGauge(elements.humGauge, data.hum, 100);

    if (elements.lastUpdate) {
        elements.lastUpdate.textContent = data.last_update;
    }

    updateStatus(data.temp);
}

function animateValue(element, start, end, duration) {
    const startTime = performance.now();
    const diff = end - start;

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        element.textContent = (start + diff * easeOut).toFixed(1);
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

function updateGauge(element, value, max) {
    if (!element) return;
    element.style.width = `${Math.min((value / max) * 100, 100)}%`;
}

function updateStatus(temp) {
    if (!elements.statusCard) return;

    elements.statusCard.classList.remove('cold', 'hot', 'waiting');

    let icon, message, statusClass;

    if (temp < CONFIG.TEMP_IDEAL_MIN) {
        icon = '❄️'; message = 'Terlalu Dingin (Perlu Pemanasan)'; statusClass = 'cold';
    } else if (temp > CONFIG.TEMP_IDEAL_MAX) {
        icon = '🔥'; message = 'Terlalu Panas (Perlu Pendinginan)'; statusClass = 'hot';
    } else {
        icon = '✓'; message = 'Suhu Ideal (Nyaman)'; statusClass = '';
    }

    if (statusClass) elements.statusCard.classList.add(statusClass);
    if (elements.statusIcon) elements.statusIcon.textContent = icon;
    if (elements.statusMessage) elements.statusMessage.textContent = message;
}

function setConnectionStatus(connected) {
    if (!elements.connectionStatus) return;

    if (connected) {
        elements.connectionStatus.classList.remove('disconnected');
        elements.connectionStatus.querySelector('.status-text').textContent = 'Terhubung';
    } else {
        elements.connectionStatus.classList.add('disconnected');
        elements.connectionStatus.querySelector('.status-text').textContent = 'Terputus';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('🌡️ Temperature Monitoring Dashboard');
    fetchSensorData();
    setInterval(fetchSensorData, CONFIG.UPDATE_INTERVAL);
});
