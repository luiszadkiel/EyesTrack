from ultralytics import YOLO
import cv2
import base64
import numpy as np
from io import BytesIO
from PIL import Image
from flask import Flask, Response

app = Flask(__name__)

# Cargar el modelo YOLOv8
model = YOLO("yolov8s.pt")  # Asegúrate de que tienes el archivo yolov8s.pt

# Función para capturar la cámara y realizar la detección de objetos
@app.route('/video_feed')
def video_feed():
    def generate():
        cap = cv2.VideoCapture(0)  # Usar la cámara predeterminada (0 es la cámara por defecto)
        while True:
            ret, frame = cap.read()
            if not ret:
                break

            # Hacer detección con YOLO
            results = model(frame)  # Realizar la detección en la imagen del frame

            # Dibujar las cajas de los objetos detectados
            for box in results[0].boxes.xywh.tolist():  # Obtener las coordenadas de las cajas (xywh)
                x1, y1, w, h = map(int, box[:4])  # Convertir las coordenadas a enteros
                x2, y2 = x1 + w, y1 + h  # Calcular el punto final de la caja
                cv2.rectangle(frame, (x1, y1), (x2, y2), (255, 0, 0), 2)  # Dibujar la caja en el frame

            # Convertir el frame a formato JPEG y luego a base64
            _, jpeg = cv2.imencode('.jpg', frame)  # Convertir la imagen a formato JPEG
            frame_b64 = base64.b64encode(jpeg.tobytes()).decode('utf-8')  # Convertir a base64 para streaming

            # Retornar el frame en un formato compatible con MJPEG
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + base64.b64decode(frame_b64) + b'\r\n\r\n')
        cap.release()

    # Devuelve el flujo de video en formato adecuado para streaming
    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')


if __name__ == "__main__":
    app.run(debug=True, threaded=True)
