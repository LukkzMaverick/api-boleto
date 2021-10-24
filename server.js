require('dotenv').config()
const routes = require('./routes')
const express = require('express')

const app = express()
const PORT = process.env.PORT || 3000;

routes(app)

app.listen(PORT, () => { console.log(`port ${PORT}`) })

module.exports =  {app}