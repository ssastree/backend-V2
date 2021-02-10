const express = require ('express')
const bodyParser = require ('body-parser')
const productosRouter = require('./api/recursos/productos/productos.route.js')

const app = express()
app.use(bodyParser.json())

app.use('/productos',productosRouter)

app.get('/', (req,res)=>{
    res.send('API venta tus cosas')
})

app.listen(3000,() => {
    console.log('escuchando en el puerto tres mil.')
})


