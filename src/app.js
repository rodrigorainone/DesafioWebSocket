import express from "express";
import handlebars from 'express-handlebars'
import {Server} from 'socket.io'
import __dirname from './utils.js';
import productRouter from "./routes/products.router.js"
import cartsRouter from "./routes/carts.router.js"
import viewsRouter from "./routes/views.router.js"
import ProductManager from "./Managers/ProductManager.js";


const productos = new ProductManager();

const app = express();
const server = app.listen(8081,()=>console.log("listening puerto 8081"))

app.use(express.static(`${__dirname}/public`))
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.engine('handlebars',handlebars.engine())
app.set ('views',`${__dirname}/views`)
app.set ('view engine','handlebars')



app.use('/',viewsRouter)
app.use('/realtimeproducts',viewsRouter)
app.use('/api/products',productRouter);
app.use('/api/carts', cartsRouter)

const io = new Server(server);

io.on ('connection',async socket=>{
    console.log("Nuevo socket conectado")
    const prod = await productos.getProducts()
    socket.emit('productos',prod);
    
    socket.on('delete',async data=>{
        const mensaje = await productos.deleteProduct(data);
        socket.emit('dataEvent',mensaje)
        const prod = await productos.getProducts()
        socket.emit('productos',prod);
    })

    socket.on('addProduct',async data=>{
        const mensaje = await productos.addProduct(data)
        socket.emit('dataEvent',mensaje)
        const prod = await productos.getProducts()
        socket.emit('productos',prod);        
    })

})