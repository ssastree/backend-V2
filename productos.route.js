const express = require ('express')
const _ = require('underscore')
const uuidv4 = require('uuid/v4')
const Joi = require('joi')

const productos = require('./../../../database.js').productos
const productosRouter = express.Router()

//const Producto = require('./productos.model')
const productoController = require('./productos.controller')

const blueprintProducto = Joi.object().keys({
  titulo: Joi.string().max(100).required(),
  precio: Joi.number().positive().precision(2).required(),
  moneda: Joi.string().length(3).uppercase()
})

//middelware  , función previa productosRouter.post
const validarProducto = (req, res, next) =>{
  let resultado = Joi.validate(req.body, blueprintProducto, { abortEarly: false, convert: false })
  if (resultado.error === null) {
    next()
    // ojo el middelware "retorna" aquí despues de ir a next 
  } else {
    // reduce "selecciona" y concatena cada error del array "resultado.error.details" en una unica cadena
    let erroresDeValidacion = resultado.error.details.reduce((acumulador,error)=> {
      return acumulador + `${error.message}`
    },"")

    //console.log(resultado.error.details)
    console.log(erroresDeValidacion)
    res.status(400).send(`Tu producto debe especificar un titulo, precio y moneda. Errores en tu request: ${erroresDeValidacion}`)
  }
}

productosRouter.get('/', (req, res) => {
        productoController.obtenerProductos()
        .then(productos => {
          res.json(productos)
        })
        .catch(err => {
          res.status(500).send("Error al leer los productos de la base de datos")
        })
    })


productosRouter.post('/', validarProducto, (req, res)=> {
  let nuevoProducto = req.body  
 
  /* new Producto ({ titulo: nuevoProducto.titulo,  
                  precio: nuevoProducto.precio, 
                  moneda: nuevoProducto.moneda,  }).save() */
  productoController.crearProducto(req.body)
  .then(producto => {
    console.log("Producto agregado a la colección productos", producto)
    res.status(201).json(producto)
  })
  .catch(err => {
    console.log("Error. Producto no pudo ser creado",err)
    res.status(500).send("Error ocurrió al crear producto en database")
  })

  //nuevoProducto.id = uuidv4()
  //productos.push(nuevoProducto)
  //res.status(201).json(nuevoProducto) // responde 'creado' a cliente
})

productosRouter.get('/:id', (req, res) => {
  for (let producto of productos) {
      if(producto.id == req.params.id){
      res.json(producto)
      return
      }
  }
//Not found
res.status(404).send(`El producto con id ${req.params.id} no existe`)
})

//Reemplazo total de un producto
productosRouter.put('/:id', validarProducto, (req, res) =>{
  let idz = req.params.id
  let reemplazoParaProducto = req.body
  console.log(reemplazoParaProducto)
  
  //  _  nombre objeto de 'underscore'. Busca id en la lista de productos
  let indice = _.findIndex(productos, producto => producto.id == idz)
  if (indice !== -1){
    reemplazoParaProducto.id = idz  
    productos[indice] = reemplazoParaProducto
    res.status(200).json(reemplazoParaProducto)
  }else{
      res.status(400).send(`El producto con id ${id} no existe`)
  }
})

productosRouter.delete('/:id', (req,res)=> {
  let indiceABorrar= _.findIndex(productos, producto => producto.id == req.params.id)
  if (indiceABorrar ===-1) {
    res.status(404).send(`Producto con id ${req.params.id} no existe. Nada que borrar`)
    return
  }
  let borrado = productos.splice(indiceABorrar,1)
  res.json(borrado)

})


module.exports = productosRouter


