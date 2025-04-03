const express = require("express");
const router = express.Router();
const Controller_home = require("../controladores/Controllers_home");

// Definición de rutas
router.get('/', Controller_home.home); // Esta ruta debería llamar a home()
router.get('/Statistics_country', Controller_home.Statistics_countryCONTROL); // Esta ruta debería llamar a Statistics_countryCONTROL
router.get('/Contact', Controller_home.Contact_CONTROL); // Esta ruta debería llamar a Statistics_countryCONTROL

module.exports = router;
