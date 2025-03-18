const db = require("./Coneccion");
const bcrypt = require("bcryptjs");

class Usuario {
    static registrarUsuario(usuario, clave, fkEmpleado, callback) {
        const saltRounds = 10;
        bcrypt.hash(clave, saltRounds, (err, hashedPassword) => {
            if (err) return callback("❌ Error al cifrar la contraseña", null);

            const sql = "INSERT INTO Usuarios (Usuario, Clave, Fk_Empleados) VALUES (?, ?, ?)";
            db.run(sql, [usuario, hashedPassword, fkEmpleado], function (err) {
                if (err) return callback("❌ Error al registrar usuario", null);
                callback(null, `✅ Usuario registrado con ID: ${this.lastID}`);
            });
        });
    }

    static loginUsuario(usuario, clave, callback) {
        const sql = "SELECT * FROM Usuarios WHERE Usuario = ?";
        db.get(sql, [usuario], (err, row) => {
            if (err) return callback("❌ Error en la base de datos", null);
            if (!row) return callback("❌ Usuario no encontrado", null);

            bcrypt.compare(clave, row.Clave, (err, res) => {
                if (err) return callback("❌ Error al verificar la contraseña", null);
                if (res) return callback(null, `✅ Bienvenido, ${usuario}!`);
                callback("❌ Contraseña incorrecta", null);
            });
        });
    }
}

module.exports = Usuario;
