const sqlite3 = require("sqlite3").verbose();

// Conexión a la base de datos (en memoria o en archivo)
const db = new sqlite3.Database(":memory:", (err) => {
    if (err) {
        console.error("❌ Error al conectar con la base de datos:", err.message);
    } else {
        console.log("✅ Base de datos conectada.");
    }
});

// Crear las tablas
db.serialize(() => {
    // Crear tabla de empleados
    db.run(`CREATE TABLE IF NOT EXISTS Empleados (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Nombre TEXT NOT NULL,
        DNI TEXT UNIQUE NOT NULL,
        Direccion TEXT NOT NULL,
        NOTelefono TEXT NOT NULL,
        FechaDeIngreso TEXT NOT NULL
    )`);

    // Crear tabla de usuarios
    db.run(`CREATE TABLE IF NOT EXISTS Usuarios (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        Usuario TEXT UNIQUE NOT NULL,
        Clave TEXT NOT NULL,
        Fk_Empleados INTEGER NOT NULL,
        FOREIGN KEY (Fk_Empleados) REFERENCES Empleados(ID)
    )`);

    // Crear tabla de videos
    db.run(`CREATE TABLE IF NOT EXISTS Videos (
        ID INTEGER PRIMARY KEY AUTOINCREMENT,
        DireccionHecho TEXT NOT NULL,
        PersonasInvolucradas TEXT NOT NULL,
        TipoDeAsalto TEXT NOT NULL,
        TipoDeArma TEXT NOT NULL,
        FechaYHora TEXT NOT NULL,
        Video15min BLOB NOT NULL,
        Descripcion TEXT NOT NULL,
        EstadoAlerta TEXT NOT NULL
    )`);
});

// Exportar la conexión a la base de datos
module.exports = db;
