const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("C:/Users/adria/OneDrive/Escritorio/Competencia/PROYECTO.db"); // aqui debesponer la direccion del proyecto, lo hice asi por que era mas directo

const Usuario = {
    obtenerTodos: (callback) => {
        db.all("SELECT * FROM empleados", [], (err, rows) => {
            callback(err, rows);
        });
    },

    agregar: (Nombre, DNI, Direccion, NOTelefono, FechaDeIngreso, callback) => {
        db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            const sql = "INSERT INTO Empleados (Nombre, DNI, Direccion, NOTelefono, FechaDeIngreso) VALUES (?, ?, ?, ?, ?)";
            db.run(sql, [Nombre, DNI, Direccion, NOTelefono, FechaDeIngreso], function (err) {
                if (err) {
                    console.error("Error al insertar el usuario:", err.message);
                    db.run("ROLLBACK");
                } else {
                    console.log("Usuario agregado correctamente.");
                    db.run("COMMIT");
                }
                callback(err);
            });
        });
    }
};

// Inserción de prueba
Usuario.agregar("Hendrix Rubio", "8984684", "mi casa", "8299789566", "2020-06-08", (err) => {
    if (err) {
        console.log("Hubo un error al insertar.");
    } else {
        console.log("Inserción exitosa.");
    }
});
