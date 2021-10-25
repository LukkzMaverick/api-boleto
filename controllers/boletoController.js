const MESSAGES = require('../utils/messages');
const moment = require('moment');
module.exports = {

    async getBoleto(req, res) {
        try {
            const linhaDigitavel = `${req.params.linhaDigitavel}`
            const barCodeIsNotNumeric = linhaDigitavel.match(/^[0-9]+$/) == null
            let amount
            let data = new Date('1997-10-07');
            let fatorVencimento
            let barCode
            if (barCodeIsNotNumeric) {
                return res.status(400).send({ errors: [{ msg: MESSAGES.CODIGO_BARRAS_SOMENTE_NUMERICO }] })
            }
            const boletoEhConvenio = linhaDigitavel.length === 48 && linhaDigitavel[0] == '8'
            const boletoEhTitulo = linhaDigitavel.length === 47
            if (boletoEhConvenio) {

                barCode = Array.from(linhaDigitavel)
                const digitosVerificadores = []
                const digitoVerificador1 = barCode.splice(11, 1)[0];
                const digitoVerificador2 = barCode.splice(22, 1)[1];
                const digitoVerificador3 = barCode.splice(33, 1)[2];
                const digitoVerificador4 = barCode.splice(44, 1)[3];
                digitosVerificadores.push(digitoVerificador1, digitoVerificador2, digitoVerificador3, digitoVerificador4)
                barCode = barCode.join('')

                const digitoCalculadoPeloModulo10 = ['6','7'].includes(barCode[2])
                const digitoCalculadoPeloModulo11 = ['8','9'].includes(barCode[2])

                if(digitoCalculadoPeloModulo10){
                }else if(digitoCalculadoPeloModulo11){
                }else{
                    return res.status(400).send({ errors: [{ msg: MESSAGES.IDENTIFICADOR_VALOR_EFETIVO_OU_REFERENCIA_INVALIDO }] })
                }


                amount = (parseFloat(barCode.substring(4, 15)) / 100).toFixed(2)
                const dataJunta = barCode.substring(27, 35)
                data = new Date(`${dataJunta.substring(0, 4)}-${dataJunta.substring(4, 6)}-${dataJunta.substring(6, 8)}`)

            } else if (boletoEhTitulo) {
                const digitosVerificadores = []
                for(let i = 9; i <= 31; i+=11 ){
                    digitosVerificadores.push(linhaDigitavel[i])
                }

                barCode = `${linhaDigitavel.substring(0, 4)}${linhaDigitavel.slice(linhaDigitavel.length - 15)}${linhaDigitavel.substring(4, 9)}${linhaDigitavel.substring(10, 16)}${linhaDigitavel.substring(16, 20)}${linhaDigitavel.substring(21, 31)}`
                fatorVencimento = parseInt(linhaDigitavel.substring(33, 37))
                amount = (parseFloat(linhaDigitavel.slice(linhaDigitavel.length - 10)) / 100).toFixed(2)
                if (fatorVencimento != 0) {
                    data.setDate(data.getDate() + fatorVencimento)
                } else {
                    data = null
                }
            } else {
                return res.status(400).send({ errors: [{ msg: MESSAGES.BOLETO_QUANTIDADE_DIGITOS }] })
            }

            if (data) {
                data.setTime(data.getTime() + data.getTimezoneOffset() * 60 * 1000);
                data = moment(data).format('YYYY-MM-DD')
            }
            return res.status(200).json({
                barCode: barCode,
                amount,
                expirationDate: data
            })

        } catch (error) {
            return res.status(500).send({ errors: [{ msg: MESSAGES.INTERNAL_SERVER_ERROR }] })
        }
    },
}
