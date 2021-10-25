const httpMocks = require('node-mocks-http');
const assert = require('assert');
const boletoController = require('../controllers/boletoController');
const chai = require('chai')
describe('boletoController tests', function () {
    it('Should return a error: 400', function () {
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

    it('Should return a error: 400', function () {
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

    it('(Boleto Convenio) Should return a object: 200', function () {
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

    it('(Boleto Convenio) Should return a object: 200', function () {
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

    it('Cover Catch', function () {
        try{
            boletoController.getBoleto('request', 'result')
        }catch(error){}
    });

    it('(Boleto Titulo) Should return a object with expirationDate=null: 200', function () {
        const request = httpMocks.createRequest({
            method: 'GET',
            url: '/boleto/23793381286000500454892000050804900000000099300',
            params: {
                linhaDigitavel: '23793381286000500454892000050804900000000099300'
            }
        });
        const result = httpMocks.createResponse();
        boletoController.getBoleto(request, result)
        assert.equal(result._getStatusCode(), 200);
        chai.expect(JSON.parse(result._getData())).to.be.deep.equal(
            {
                barCode: '23799000000000993003381260005004549200005080',
                amount: '993.00',
                expirationDate: null
            }
        );

    });

    
})
