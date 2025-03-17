import threading
import cv2
import time
from flask import Flask, Response, render_template
from flask_socketio import SocketIO
from inference import InferencePipeline
from flask_cors import CORS


# Variable global para almacenar el último frame procesado
latest_frame = None
frame_lock = threading.Lock()  # Lock para evitar accesos simultáneos
pipeline = None  # Variable global para el pipeline

app = Flask(__name__)
CORS(app)  # Habilitar CORS para las solicitudes HTTP
socketio = SocketIO(app, cors_allowed_origins="*")  # Habilitar CORS para Socket.IO


# Función de callback para Roboflow Inference
def my_sink(result, video_frame):
    global latest_frame
    if result.get("output_image"):
        with frame_lock:
            latest_frame = result["output_image"].numpy_image
        
        # Solo enviar alerta si hay peligro o se detectan armas/cuchillos
        danger = result.get('danger', False)
        guns_count = result.get('guns_count', 0)
        knifes_count = result.get('knifes_count', 0)
        persons_count = result.get('persons_count', 0)
        
        if danger:
            alert_data = {
                'danger': danger,
                'persons_count' : persons_count,
                'guns_count': guns_count,
                'knifes_count': knifes_count
            }
            socketio.emit('alert_update', alert_data)

# Inicializar el pipeline
def init_pipeline():
    global pipeline
    pipeline = InferencePipeline.init_with_workflow(
        api_key="w3Poe3NOOssV1l17rkSS",
        workspace_name="yeurydcm",
        workflow_id="detect-count-and-visualize",
        video_reference=0,
        max_fps=30,
        on_prediction=my_sink
    )

# Ruta que proporciona el stream de video
@app.route('/video_feed')
def video_feed():
    print("entró")
    # Iniciar el pipeline en un hilo separado si no está ya iniciado
    global pipeline
    if pipeline is None:
        init_pipeline()
        threading.Thread(target=lambda: pipeline.start(), daemon=True).start()
        # Esperar un momento para que el pipeline comience a generar frames
        time.sleep(2)
    
    def generate():
        global latest_frame
        while True:
            with frame_lock:
                current_frame = latest_frame
                if current_frame is None:
                    time.sleep(0.1)
                    continue
                
                # Convertir el frame a formato JPEG
                _, jpeg = cv2.imencode('.jpg', current_frame)
                frame_bytes = jpeg.tobytes()
            
            # Retornar el frame en formato MJPEG
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n\r\n')
            time.sleep(0.033)

    return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')
    
if __name__ == "__main__":
    # Iniciar el servidor con socketio correctamente
    socketio.run(app, host='0.0.0.0', port=5000, debug=True, use_reloader=False, allow_unsafe_werkzeug=True)