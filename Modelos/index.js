const Empleado = require("./Empleados");
const Usuario = require("./Usuarios");
const Video = require("./videos"); // Asegúrate de que la ruta del archivo sea correcta

// Esperar un poco para que las tablas se creen antes de insertar datos
setTimeout(() => {
    // Agregar un empleado
    Empleado.agregarEmpleado("Hendrix Rubio", "8984684", "Mi casa", "8299789566", "2020-06-08", (err, res) => {
        if (err) return console.error(err);
        console.log(res);

        // Registrar un usuario después de agregar al empleado
        Usuario.registrarUsuario("Hendrix Rubio", "password123", 1, (err, res) => {
            if (err) return console.error(err);
            console.log(res);

            // Intentar iniciar sesión con el usuario registrado
            Usuario.loginUsuario("Hendrix Rubio", "password123", (err, res) => {
                if (err) return console.error(err);
                console.log(res);

                // Ruta del video de prueba o url
                const videoPath = "Ingresa la url o direccion de un video."; // Cambia esto por la ruta de tu video

                // Convertir video a binario y luego procesarlo
                Video.obtenerVideoBinario(videoPath)
                    .then((videoBinario) => {
                        console.log("✅ Video convertido a formato binario con éxito.");

                        // Procesar el video
                        const direccionHecho = "Calle Ficticia 123";
                        const personasInvolucradas = "Juan Pérez, Maria García";
                        const tipoDeAsalto = "Robo";
                        const tipoDeArma = "Pistola";
                        const fechaYHora = "2025-03-25 18:30:00";
                        const descripcion = "Un robo ocurrido en la calle ficticia con armas involucradas.";
                        const estadoAlerta = "Alerta alta";

                        Video.procesarVideo(videoBinario, direccionHecho, personasInvolucradas, tipoDeAsalto, tipoDeArma, fechaYHora, descripcion, estadoAlerta, (err, res) => {
                            if (err) return console.error(err);
                            console.log(res);
                        });
                    })
                    .catch((err) => {
                        console.error("❌ Error al obtener el video binario:", err);
                    });
            });
        });
    });
}, 1000);
