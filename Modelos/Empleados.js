const db = require("./Coneccion");

class Empleado {
    static agregarEmpleado(nombre, dni, direccion, telefono, fechaIngreso, callback) {
        const sql = "INSERT INTO Empleados (Nombre, DNI, Direccion, NOTelefono, FechaDeIngreso) VALUES (?, ?, ?, ?, ?)";
        db.run(sql, [nombre, dni, direccion, telefono, fechaIngreso], function (err) {
            if (err) return callback("❌ Error al agregar empleado", null);
            callback(null, `✅ Empleado registrado con ID: ${this.lastID}`);
        });
    }
}

module.exports = Empleado;
