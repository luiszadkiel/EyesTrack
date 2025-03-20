const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const db = require("./Coneccion"); // Asegúrate de importar tu conexión a la base de datos

// Función para guardar el video binario en un archivo temporal
const guardarVideoTemporal = (videoBinario) => {
    return new Promise((resolve, reject) => {
        const tempPath = path.join(__dirname, 'temp_video.mp4'); // Ruta temporal para el video
        fs.writeFile(tempPath, videoBinario, (err) => {
            if (err) {
                reject("❌ Error al guardar el video temporal: " + err.message);
                return;
            }
            resolve(tempPath); // Devuelve la ruta del archivo temporal
        });
    });
};

// Función para obtener el formato binario de un video
const obtenerVideoBinario = (videoPath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(videoPath, (err, data) => {
            if (err) {
                reject("❌ Error al leer el archivo de video: " + err.message);
                return;
            }
            resolve(data); // Devuelve el video en formato binario
        });
    });
};

// Función para procesar el video
const procesarVideo = (videoBinario, direccionHecho, personasInvolucradas, tipoDeAsalto, tipoDeArma, fechaYHora, descripcion, estadoAlerta, callback) => {
    guardarVideoTemporal(videoBinario)
        .then((tempVideoPath) => {
            console.log("✅ Video guardado en archivo temporal.");

            // Verificar la duración del video usando ffmpeg.ffprobe
            ffmpeg.ffprobe(tempVideoPath, (err, metadata) => {
                if (err) {
                    callback("❌ Error al analizar el video:", err.message);
                    return;
                }

                const videoDuration = metadata.format.duration; // Duración en segundos
                if (videoDuration > 900) { // 900 segundos = 15 minutos
                    // Recortar el video a los primeros 15 minutos
                    const trimmedVideoPath = path.join(__dirname, 'trimmed_video.mp4'); // Ruta del video recortado

                    ffmpeg(tempVideoPath)
                        .setStartTime('00:00:00')   // Empieza desde el inicio
                        .setDuration(900)            // Limita a 15 minutos
                        .output(trimmedVideoPath)    // Archivo de salida recortado
                        .on('end', () => {
                            console.log('✅ Video recortado con éxito.');

                            // Leer el video recortado y almacenarlo en la base de datos
                            fs.readFile(trimmedVideoPath, (err, data) => {
                                if (err) {
                                    callback("❌ Error al leer el video recortado:", err.message);
                                    return;
                                }

                                // Guardar el video recortado en la base de datos
                                const sql = `INSERT INTO Videos (DireccionHecho, PersonasInvolucradas, TipoDeAsalto, TipoDeArma, FechaYHora, Video15min, Descripcion, EstadoAlerta)
                                             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                                db.run(sql, [direccionHecho, personasInvolucradas, tipoDeAsalto, tipoDeArma, fechaYHora, data, descripcion, estadoAlerta], function (err) {
                                    if (err) {
                                        callback("❌ Error al agregar el video: " + err.message, null);
                                    } else {
                                        callback(null, `Video registrado con ID: ${this.lastID}`);
                                    }
                                });
                            });
                        })
                        .on('error', (err) => {
                            callback("❌ Error al recortar el video:", err.message);
                        })
                        .run();
                } else {
                    // Si el video tiene menos de 15 minutos, simplemente guardarlo
                    fs.readFile(tempVideoPath, (err, data) => {
                        if (err) {
                            callback("❌ Error al leer el video:", err.message);
                            return;
                        }

                        // Guardar el video en la base de datos
                        const sql = `INSERT INTO Videos (DireccionHecho, PersonasInvolucradas, TipoDeAsalto, TipoDeArma, FechaYHora, Video15min, Descripcion, EstadoAlerta)
                                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                        db.run(sql, [direccionHecho, personasInvolucradas, tipoDeAsalto, tipoDeArma, fechaYHora, data, descripcion, estadoAlerta], function (err) {
                            if (err) {
                                callback("❌ Error al agregar el video: " + err.message);
                            } else {
                                callback(null, `Video registrado con ID: ${this.lastID}`);
                            }
                        });
                    });
                }
            });
        })
        .catch((err) => {
            callback(err, null);
        });
};

module.exports = {
    obtenerVideoBinario,
    procesarVideo
};
