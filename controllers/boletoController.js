const MESSAGES = require('../utils/messages');
const moment = require('moment');
const assert = require('assert');

module.exports = {

    async getBoleto(req, res) {
        try {
            const linhaDigitavel = `${req.params.linhaDigitavel}`
            const barCodeIsNotNumeric = linhaDigitavel.match(/^[0-9]+$/) == null
            let data = new Date('1997-10-07');
            let barCode, fatorVencimento, amount
            if (barCodeIsNotNumeric) {
                return res.status(400).send({ errors: [{ msg: MESSAGES.CODIGO_BARRAS_SOMENTE_NUMERICO }] })
            }
            const boletoEhConvenio = linhaDigitavel.length === 48 && linhaDigitavel[0] == '8'
            const boletoEhTitulo = linhaDigitavel.length === 47
            if (boletoEhConvenio) {

                barCode = Array.from(linhaDigitavel)
                const digitoVerificador1 = barCode.splice(11, 1)[0];
                const digitoVerificador2 = barCode.splice(22, 1)[0];
                const digitoVerificador3 = barCode.splice(33, 1)[0];
                const digitoVerificador4 = barCode.splice(44, 1)[0];
                const digitosVerificadores = []
                digitosVerificadores.push(digitoVerificador1, digitoVerificador2, digitoVerificador3, digitoVerificador4)

                barCode = barCode.join('')

                const digitoCalculadoPeloModulo10 = ['6', '7'].includes(barCode[2])
                const digitoCalculadoPeloModulo11 = ['8', '9'].includes(barCode[2])
                let dac1, dac2, dac3, dac4
                const digitoVerificadorLinhaDigitavel = barCode[3]
                let digitoVerificador
                const campos = []
                const dacs = []
                campos.push(barCode.substring(0, 11),
                    barCode.substring(11, 22),
                    barCode.substring(22, 33),
                    barCode.substring(33, 44))
                const primeiroCampo = barCode.substring(0,3)
                const segundoCampo = barCode.substring(4,44)
                if (digitoCalculadoPeloModulo10) {
                    dac1 = calcularDACModulo10(campos[0])
                    dac2 = calcularDACModulo10(campos[1])
                    dac3 = calcularDACModulo10(campos[2])
                    dac4 = calcularDACModulo10(campos[3])
                    digitoVerificador = calcularDigitoVerificadorConvenioModulo10(primeiroCampo,segundoCampo)
                } else if (digitoCalculadoPeloModulo11) {
                    dac1 = calcularDACModulo11(campos[0])
                    dac2 = calcularDACModulo11(campos[1])
                    dac3 = calcularDACModulo11(campos[2])
                    dac4 = calcularDACModulo11(campos[3])
                    digitoVerificador = calcularDigitoVerificadorConvenioModulo11(primeiroCampo,segundoCampo)
                } else {
                    return res.status(400).send({ errors: [{ msg: MESSAGES.IDENTIFICADOR_VALOR_EFETIVO_OU_REFERENCIA_INVALIDO }] })
                }
                dacs.push(dac1, dac2, dac3, dac4)

                try {
                    assert.equal(digitoVerificador, digitoVerificadorLinhaDigitavel)
                } catch (error) {
                    return res.status(400).send({ errors: [{ msg: MESSAGES.DIGITO_VERIFICADOR_GERAL_INCORRETO }] })
                }

                try {
                    assert.deepEqual(dacs, digitosVerificadores)
                } catch (error) {
                    return res.status(400).send({ errors: [{ msg: MESSAGES.DAC_INCORRETO }] })
                }

             


                amount = (parseFloat(barCode.substring(4, 15)) / 100).toFixed(2)
                const dataJunta = barCode.substring(27, 35)
                data = new Date(`${dataJunta.substring(0, 4)}-${dataJunta.substring(4, 6)}-${dataJunta.substring(6, 8)}`)

            } else if (boletoEhTitulo) {
                const digitosVerificadoresLinhaDigitavel = []
                for (let i = 9; i <= 31; i += 11) {
                    digitosVerificadoresLinhaDigitavel.push(linhaDigitavel[i])
                }
                digitosVerificadoresLinhaDigitavel.push(linhaDigitavel[32])
                const campos = []
                const campo1 = linhaDigitavel.substring(0, 9)
                const campo2 = linhaDigitavel.substring(10, 20)
                const campo3 = linhaDigitavel.substring(21, 31)
                const somaCampos = {
                    campo1: 0,
                    campo2: 0,
                    campo3: 0
                }
                campos.push(campo1, campo2, campo3)
                let j = 1
                for (const campo of campos) {
                    let alterna = 2
                    for (let i = campo.length - 1; i >= 0; i--) {
                        let aSerSomado = campo[i] * alterna
                        const aSerSomadoString = `${aSerSomado}`
                        if (aSerSomadoString.length > 1) {
                            aSerSomado = parseInt(aSerSomadoString[0]) + parseInt(aSerSomadoString[1])
                        }
                        somaCampos[`campo${j}`] += aSerSomado
                        if (alterna == 2) {
                            alterna = 1
                        } else {
                            alterna = 2
                        }
                    }
                    j++
                }
                let restoCampos = {
                    campo1: somaCampos.campo1 % 10,
                    campo2: somaCampos.campo2 % 10,
                    campo3: somaCampos.campo3 % 10,
                }
                let digitosVerificadores = []
                for (let i = 1; i <= 3; i++) {
                    let temp = (somaCampos[`campo${i}`] + 10) / 10
                    temp = Math.trunc(temp)
                    temp = `${temp * 10 - restoCampos[`campo${i}`]}`
                    if (temp.length > 1) {
                        temp = temp.slice(-1)
                    }
                    digitosVerificadores.push(temp)
                }
                digitosVerificadores.push(calcularDigitoVerificadorTituloModulo11())
                try {
                    assert.deepEqual(digitosVerificadores, digitosVerificadoresLinhaDigitavel)
                } catch (error) {
                    return res.status(400).send({ errors: [{ msg: MESSAGES.DIGITOS_VERIFICADORES_INCORRETOS }] })
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
            if(data == "Invalid Date"){
                data = null
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

            function calcularDigitoVerificadorTituloModulo11() {
                let barCodeSemDigitoVerificador = `${linhaDigitavel.substring(0, 4)}${linhaDigitavel.slice(linhaDigitavel.length - 14)}${linhaDigitavel.substring(4, 9)}${linhaDigitavel.substring(10, 16)}${linhaDigitavel.substring(16, 20)}${linhaDigitavel.substring(21, 31)}`
                let pesoMultiplicador = 2
                let digitosMultiplicados = []
                for (let i = 42; i >= 0; i--) {
                    digitosMultiplicados.push(barCodeSemDigitoVerificador[i] * pesoMultiplicador)
                    if (pesoMultiplicador == 9) {
                        pesoMultiplicador = 2
                    } else {
                        pesoMultiplicador++
                    }
                }
                let somaDigitos = 0
                for (const digito of digitosMultiplicados) {
                    somaDigitos += digito
                }
                const restoDivisao = somaDigitos % 11
                let dv = 11 - restoDivisao
                if ([0, 10, 11].includes(dv)) {
                    dv = 1
                }
                return `${dv}`
            }
            function calcularDigitoVerificadorConvenioModulo10(primeiroCampo, segundoCampo) {
                let alterna = 2
                let soma = 0
                const barCodeSemDigitoVerificador = `${primeiroCampo}${segundoCampo}`
                for (let i = barCodeSemDigitoVerificador.length - 1; i >= 0; i--) {
                    let aSerSomado = barCodeSemDigitoVerificador[i] * alterna
                    const aSerSomadoString = `${aSerSomado}`
                    if (aSerSomadoString.length > 1) {
                        aSerSomado = parseInt(aSerSomadoString[0]) + parseInt(aSerSomadoString[1])
                    }
                    soma += aSerSomado
                    if (alterna == 2) {
                        alterna = 1
                    } else {
                        alterna = 2
                    }
                }
                const restoDivisao = soma % 10
                const dv = 10 - restoDivisao
                if(restoDivisao === 0){
                    dv = 0
                }
                return `${dv}`
            }
            function calcularDigitoVerificadorConvenioModulo11(primeiroCampo, segundoCampo) {
                let barCodeSemDigitoVerificador = `${primeiroCampo}${segundoCampo}`
                let pesoMultiplicador = 2
                let digitosMultiplicados = []
                for (let i = barCodeSemDigitoVerificador.length - 1; i >= 0; i--) {
                    digitosMultiplicados.push(barCodeSemDigitoVerificador[i] * pesoMultiplicador)
                    if (pesoMultiplicador == 9) {
                        pesoMultiplicador = 2
                    } else {
                        pesoMultiplicador++
                    }
                }
                let somaDigitos = 0
                for (const digito of digitosMultiplicados) {
                    somaDigitos += digito
                }
                const restoDivisao = somaDigitos % 11
                let dv = 11 - restoDivisao
                if (restoDivisao == 0 || restoDivisao == 1) {
                    dv = 0
                }else if(restoDivisao == 10){
                    dv = 1
                }
                return `${dv}`
            }
            function calcularDACModulo11(sequencia11Digitos) {
                let pesoMultiplicador = 2
                let digitosMultiplicados = []
                for (let i = 10; i >= 0; i--) {
                    digitosMultiplicados.push(sequencia11Digitos[i] * pesoMultiplicador)
                    if (pesoMultiplicador == 9) {
                        pesoMultiplicador = 2
                    } else {
                        pesoMultiplicador++
                    }
                }
                let somaDigitos = 0
                for (const digito of digitosMultiplicados) {
                    somaDigitos += digito
                }
                const restoDivisao = somaDigitos % 11
                let dv = 11 - restoDivisao
                if (restoDivisao == 0 || restoDivisao == 1) {
                    dv = 0
                } else if (restoDivisao == 10) {
                    dv = 1
                }
                return `${dv}`
            }
            function calcularDACModulo10(sequencia11Digitos) {
                let alterna = 2
                let soma = 0
                for (let i = sequencia11Digitos.length - 1; i >= 0; i--) {
                    let aSerSomado = sequencia11Digitos[i] * alterna
                    const aSerSomadoString = `${aSerSomado}`
                    if (aSerSomadoString.length > 1) {
                        aSerSomado = parseInt(aSerSomadoString[0]) + parseInt(aSerSomadoString[1])
                    }
                    soma += aSerSomado
                    if (alterna == 2) {
                        alterna = 1
                    } else {
                        alterna = 2
                    }
                }
                const restoDivisao = soma % 10
                let dac = 10 - restoDivisao
                if(restoDivisao === 0){
                    dac = 0
                }
                return `${dac}`

            }
        } catch (error) {
            console.error(error)
            return res.status(500).send({ errors: [{ msg: MESSAGES.INTERNAL_SERVER_ERROR }] })
        }
    },
}
