const httpMocks = require('node-mocks-http');
const assert = require('assert');
const boletoController = require('../controllers/boletoController');
const chai = require('chai')
describe('boletoController tests', function () {
    it('Should return a error numberOfChars: 400', function () {
        const request = httpMocks.createRequest({
            method: 'GET',
            url: '/boleto/42',
            params: {
                linhaDigitavel: '42'
            }
        });
        const result = httpMocks.createResponse();
        boletoController.getBoleto(request, result)
        assert.equal(result._getStatusCode(), 400);
    });

    it('Should return a error char in linhaDigitavel: 400', function () {
        const request = httpMocks.createRequest({
            method: 'GET',
            url: '/boleto/42s',
            params: {
                linhaDigitavel: '42s'
            }
        });
        const result = httpMocks.createResponse();
        boletoController.getBoleto(request, result)
        assert.equal(result._getStatusCode(), 400);
    });

    it('(Boleto Convenio - Modulo 10) Should return a object: 200', function () {
        const request = httpMocks.createRequest({
            method: 'GET',
            url: '/boleto/896100000000599800010119053332010064260000157446',
            params: {
                linhaDigitavel: '896100000000599800010119053332010064260000157446'
            }
        });
        const result = httpMocks.createResponse();
        boletoController.getBoleto(request, result)
        assert.equal(result._getStatusCode(), 200);
        chai.expect(JSON.parse(result._getData())).to.be.deep.equal({
            "barCode": "89610000000599800010110533320100626000015744",
            "amount": "59.98",
            "expirationDate": "2010-06-26"
        });
    });


    it('(Boleto Convenio - Modulo 11) Should return a object: 200', function () {
        const request = httpMocks.createRequest({
            method: 'GET',
            url: '/boleto/838500000040451400310503003274392032000061814547',
            params: {
                linhaDigitavel: '838500000040451400310503003274392032000061814547'
            }
        });
        const result = httpMocks.createResponse();
        boletoController.getBoleto(request, result)
        assert.equal(result._getStatusCode(), 200);
        chai.expect(JSON.parse(result._getData())).to.be.deep.equal({
            "barCode": "83850000004451400310500032743920300006181454",
            "amount": "445.14",
            "expirationDate": null
        });
    });

    it('(Boleto Convenio - Modulo 11) Should return a error DAC_INCORRETO: 400', function () {
        const request = httpMocks.createRequest({
            method: 'GET',
            url: '/boleto/838500000041451400310503003274392032000061814547',
            params: {
                linhaDigitavel: '838500000041451400310503003274392032000061814547'
            }
        });
        const result = httpMocks.createResponse();
        boletoController.getBoleto(request, result)
        assert.equal(result._getStatusCode(), 400);
    });

    it('(Boleto Convenio - Modulo 10) Should return a error DIGITO_VERIFICADOR_GERAL_INCORRETO: 400', function () {
        const request = httpMocks.createRequest({
            method: 'GET',
            url: '/boleto/896000000000599800010119053332010064260000157446',
            params: {
                linhaDigitavel: '896000000000599800010119053332010064260000157446'
            }
        });
        const result = httpMocks.createResponse();
        boletoController.getBoleto(request, result)
        assert.equal(result._getStatusCode(), 400);
    });

    it('(Boleto Convenio) Should return a error: 400', function () {
        const request = httpMocks.createRequest({
            method: 'GET',
            url: '/boleto/892100000000599800010119053332010064260000157446',
            params: {
                linhaDigitavel: '892100000000599800010119053332010064260000157446'
            }
        });
        const result = httpMocks.createResponse();
        boletoController.getBoleto(request, result)
        assert.equal(result._getStatusCode(), 400);
    });

    it('(Boleto Convenio) Should return a object: 200', function () {
        const request = httpMocks.createRequest({
            method: 'GET',
            url: '/boleto/858000000003600003282102810708210595963186278980',
            params: {
                linhaDigitavel: '858000000003600003282102810708210595963186278980'
            }
        });
        const result = httpMocks.createResponse();
        boletoController.getBoleto(request, result)
        assert.equal(result._getStatusCode(), 200);
        chai.expect(JSON.parse(result._getData())).to.be.deep.equal( {
            "barCode": "85800000000600003282108107082105996318627898",
            "amount": "60.00",
            "expirationDate": null
        });
       
    });

    it('(Boleto Titulo) Should return a object: 200', function () {
        const request = httpMocks.createRequest({
            method: 'GET',
            url: '/boleto/23793381286000500454892000050804987840000099300',
            params: {
                linhaDigitavel: '23793381286000500454892000050804987840000099300'
            }
        });
        const result = httpMocks.createResponse();
        boletoController.getBoleto(request, result)
        assert.equal(result._getStatusCode(), 200);
        chai.expect(JSON.parse(result._getData())).to.be.deep.equal({
            "barCode": "23799878400000993003381260005004549200005080",
            "amount": "993.00",
            "expirationDate": "2021-10-25"
        });
    });

    it('(Boleto Titulo) Should return a error, digito verificador: 400', function () {
        const request = httpMocks.createRequest({
            method: 'GET',
            url: '/boleto/23793381226000500454892000050804987840000099300',
            params: {
                linhaDigitavel: '23793381226000500454892000050804987840000099300'
            }
        });
        const result = httpMocks.createResponse();
        boletoController.getBoleto(request, result)
        assert.equal(result._getStatusCode(), 400);
    });

    it('Cover Catch', function () {
        try {
            boletoController.getBoleto('request', 'result')
        } catch (error) { }
    });

    it('(Boleto Titulo) Should return a object with expirationDate=null: 200', function () {
        const request = httpMocks.createRequest({
            method: 'GET',
            url: '/boleto/23793381286000500454892000050804300000000099300',
            params: {
                linhaDigitavel: '23793381286000500454892000050804300000000099300'
            }
        });
        const result = httpMocks.createResponse();
        boletoController.getBoleto(request, result)
        assert.equal(result._getStatusCode(), 200);
        chai.expect(JSON.parse(result._getData())).to.be.deep.equal(
            {
                barCode: '23793000000000993003381260005004549200005080',
                amount: '993.00',
                expirationDate: null
            }
        );

    });

    it('(Boleto Titulo) Should return a object: 200', function () {
        const request = httpMocks.createRequest({
            method: 'GET',
            url: '/boleto/23793381286000652880095000050807286620000101299',
            params: {
                linhaDigitavel: '23793381286000652880095000050807286620000101299'
            }
        });
        const result = httpMocks.createResponse();
        boletoController.getBoleto(request, result)
        assert.equal(result._getStatusCode(), 200);
        chai.expect(JSON.parse(result._getData())).to.be.deep.equal(
            {
                "barCode": "23792866200001012993381260006528809500005080",
                "amount": "1012.99",
                "expirationDate": "2021-06-25"
            }
        );

    });
    //65590000020044250000552858766000688430000002500

})
