const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

// Ruta de la base de datos
const dbPath = "C:/Users/adria/OneDrive/Escritorio/Competencia/PROYECTO.db";

// Verificar si la base de datos existe antes de intentar abrirla
if (!fs.existsSync(dbPath)) {
    process.exit(1); // Termina el programa si la base de datos no existe
} else {
    console.log("✅ La base de datos existe. Conectando...");
}

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.error("❌ Error al conectar con SQLite:", err.message);
    } else {
        console.log("✅ Conectado correctamente a la base de datos SQLite.");
    }
});

module.exports = db;
