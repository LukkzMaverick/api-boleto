const {Router} = require('express')
const boletoController = require('../controllers/boletoController')
const router = Router()

router.get('/:linhaDigitavel', boletoController.getBoleto)

module.exports = router