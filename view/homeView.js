const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    //no es recomendable hacer las funciones acá
    //pero como solo va renderizar el inicio lo saltare esa regla
    res.render('index');
});

module.exports = router;