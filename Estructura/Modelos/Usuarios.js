const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("C:/Users/adria/OneDrive/Escritorio/Competencia/PROYECTO.db");


class Login {
    constructor() {
        this.db = db;
    }


    registrarUsuario(Usuario, clave, Fk_Empleados, callback) {
       //Cifrado de contraseña
        const bcrypt = require("bcryptjs");
        const saltRounds = 10;
        bcrypt.hash(clave, saltRounds, (err, hashedPassword) => {
            if (err) {
                callback("Error al hashear la contraseña", null);
                return;
            }

            const sql = "INSERT INTO Usuarios (Usuario, Clave, Fk_Empleados) VALUES (?, ?, ?)";
            this.db.run(sql, [Usuario, hashedPassword, Fk_Empleados], function (err) {
                if (err) {
                    callback("Error al insertar el usuario", null);
                } else {
                    callback(null, `Usuario registrado con ID: ${this.lastID}`);
                }
            });
        });
    }

   //verificacion si son correctos los datos
    loginUsuario(Usuario, clave, callback) {
        const sql = "SELECT * FROM Usuarios WHERE Usuario = ?";
        this.db.get(sql, [Usuario], (err, row) => {
            if (err) {
                callback("Error al consultar la base de datos", null);
                return;
            }
            if (!row) {
                callback("El usuario no existe", null);
                return;
            }

            // Comparar la contraseña con la que ya guardamos
            const bcrypt = require("bcryptjs");
            bcrypt.compare(clave, row.Clave, (err, res) => {
                if (err) {
                    callback("Error al comparar las contraseñas", null);
                    return;
                }
                if (res) {
                    callback(null, `Bienvenido, ${Usuario}!`);
                } else {
                    callback("Contraseña incorrecta", null);
                }
            });
        });
    }
}



//seccion de pruebas login y registro

// Crear una instancia de la clase Login
const login = new Login();

// Ejemplo de uso para registrar un nuevo usuario
/*login.registrarUsuario("Hendrix Rubio", "password123", 1, (err, result) => {
    if (err) {
    
        console.error(err);
    } else {
        console.log(result);
    }
});*/

// Ejemplo de uso para iniciar sesión
login.loginUsuario("Hendrix Rubio", "password123", (err, result) => {
    if (err) {
        console.error(err);
    } else {
        console.log(result);
    }
});

module.exports = Login;
