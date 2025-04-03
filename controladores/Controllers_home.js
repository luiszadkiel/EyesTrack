// controllers/Controllers_home.js

// Asegúrate de exportar las funciones
exports.home = (req, res) => {
    res.render('index'); // o lo que necesites renderizar
};

exports.Statistics_countryCONTROL = (req, res) => {
    res.render('Records_alerts'); // Asegúrate de que esta vista exista
};

exports.Contact_CONTROL = (req, res) => {
    res.render('Contact.ejs'); // Asegúrate de que esta vista exista
};