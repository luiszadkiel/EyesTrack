# Esquema básico para server.py
from flask import Flask, request, jsonify
import cv2
import numpy as np
import torch
from threading import Thread
import time
from ultralytics import YOLO  

app = Flask(__name__)

model = YOLO('pongoElModeloAhora')


# Clases a detectar (ajusta los índices según tu modelo)
TARGET_CLASSES = ['knife', 'pistol']

def process_video_stream(video_stream):
    cap = cv2.VideoCapture(video_stream)
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        # Detección con YOLO
        results = model(frame)
        
        # Verificar si hay armas o cuchillos
        detections = results.pandas().xyxy[0]
        dangerous_objects = detections[detections['name'].isin(TARGET_CLASSES)]
        
        if not dangerous_objects.empty:
            send_alarm(dangerous_objects, frame)
            
        time.sleep(0.1)  # Para no saturar el sistema
    
    cap.release()

def send_alarm(detections, frame):
    # Guardar imagen de evidencia
    timestamp = int(time.time())
    cv2.imwrite(f"evidence_{timestamp}.jpg", frame)
    
    # Enviar notificación
    # Implementa tu lógica de notificación aquí (webhook, email, SMS, etc.)
    print(f"¡ALARMA! Objetos peligrosos detectados: {detections['name'].tolist()}")
    
    # También podrías hacer una llamada a otra API
    # requests.post('https://tu-servicio-de-alertas.com/notify', json=payload)

@app.route('/process-video', methods=['POST'])
def receive_video():
    if 'video' not in request.files:
        return jsonify({"error": "No video file provided"}), 400
        
    video_file = request.files['video']
    video_path = f"temp_{int(time.time())}.mp4"
    video_file.save(video_path)
    
    # Iniciar procesamiento en segundo plano
    thread = Thread(target=process_video_stream, args=(video_path,))
    thread.daemon = True
    thread.start()
    
    return jsonify({"message": "Video processing started"}), 200

@app.route('/stream', methods=['POST'])
def receive_stream():
    # Para recibir una URL de streaming
    data = request.json
    if 'stream_url' not in data:
        return jsonify({"error": "No stream URL provided"}), 400
    
    # Iniciar procesamiento en segundo plano
    thread = Thread(target=process_video_stream, args=(data['stream_url'],))
    thread.daemon = True
    thread.start()
    
    return jsonify({"message": "Stream processing started"}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)