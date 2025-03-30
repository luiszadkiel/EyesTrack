import threading
import cv2
import time
from flask import Flask, Response, render_template
from flask_socketio import SocketIO
from inference import InferencePipeline
from flask_cors import CORS


# Variables globales
latest_frame = None
frame_lock = threading.Lock()  # Lock para evitar accesos simultáneos
pipeline = None  # Variable global para el pipeline

# Variables para el control de alertas
last_alert_time = 0
alert_cooldown = 10  # Tiempo en segundos entre alertas
consecutive_detections = 0  # Contador de detecciones consecutivas
required_consecutive_frames = 2  # Número de frames consecutivos requeridos
detection_history = {'danger': False, 'persons_count': 0, 'guns_count': 0, 'knifes_count': 0}

app = Flask(__name__)
CORS(app)  # Habilitar CORS para las solicitudes HTTP
socketio = SocketIO(app, cors_allowed_origins="*")  # Habilitar CORS para Socket.IO


# Función de callback para Roboflow Inference
def my_sink(result, video_frame):
    global latest_frame, last_alert_time, consecutive_detections, detection_history
    
    if result.get("output_image"):
        with frame_lock:
            latest_frame = result["output_image"].numpy_image
        
        # Obtener datos de detección
        current_danger = result.get('danger', False)
        current_persons_count = result.get('persons_count', 0)
        current_guns_count = result.get('guns_count', 0)
        current_knifes_count = result.get('knifes_count', 0)
        
        # Verificar si hay una detección significativa en este frame
        has_detection = current_danger 
        
        # Actualizar contador de frames consecutivos
        if has_detection: 
            consecutive_detections += 1
            # Actualizar history con los valores actuales (usamos el mayor valor para cada categoría)
            detection_history['danger'] = detection_history['danger'] or current_danger
            detection_history['persons_count'] = max(detection_history['persons_count'], current_persons_count)
            detection_history['guns_count'] = max(detection_history['guns_count'], current_guns_count)
            detection_history['knifes_count'] = max(detection_history['knifes_count'], current_knifes_count)
        else:
            # Reiniciar contador y history si no hay detección
            consecutive_detections = 0
            detection_history = {'danger': False, 'persons_count': 0, 'guns_count': 0, 'knifes_count': 0}
        
        # Verificar si debemos enviar una alerta (5 frames consecutivos y tiempo de espera)
        current_time = time.time()
        cooldown_elapsed = (current_time - last_alert_time) >= alert_cooldown
        
        if consecutive_detections >= required_consecutive_frames and cooldown_elapsed:
            # Enviar alerta y actualizar tiempo
            socketio.emit('alert_update', detection_history)
            last_alert_time = current_time
            # Reiniciar el historial después de enviar
            detection_history = {'danger': False, 'persons_count': 0, 'guns_count': 0, 'knifes_count': 0}
            consecutive_detections = 0

# Función para configurar el tiempo entre alertas (puede llamarse mediante una ruta API)
def set_alert_cooldown(seconds):
    global alert_cooldown
    alert_cooldown = max(1, seconds) 
    return {"message": f"Tiempo entre alertas configurado a {alert_cooldown} segundos"}

# Función para configurar los frames consecutivos requeridos
def set_required_frames(frames):
    global required_consecutive_frames
    required_consecutive_frames = max(1, frames)  # Mínimo 1 frame
    return {"message": f"Frames consecutivos requeridos configurados a {required_consecutive_frames}"}

# Rutas API para configuración
@app.route('/config/cooldown/<int:seconds>', methods=['POST'])
def config_cooldown(seconds):
    return set_alert_cooldown(seconds)

@app.route('/config/frames/<int:frames>', methods=['POST'])
def config_frames(frames):
    return set_required_frames(frames)

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