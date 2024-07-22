import cors from 'cors';
import path from 'path'
import dotenv from 'dotenv';

dotenv.config({path:path.resolve('config/.env')});

import AppError from '../utils/AppError.js';
import  {globalErrorHandling}  from '../utils/errorHandling.js';
import  connectionDB  from '../db/connectionDB.js';
import * as  routes from '../src/modules/index.routes.js';


const initApp = (app,express) => {

    



// Configure CORS
const corsConfig = {
    origin: "*",
    credentials: true, 
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
};
app.use(cors(corsConfig));
app.options("", cors(corsConfig));
connectionDB()
app.use(express())
app.use(express.json());

app.use(express.static(path.resolve('public')));
app.use('/users',routes.userRoutr)
app.use('/categories',routes.categoryRoutr)
app.use('/subCategories',routes.subCategoryRoutr)
app.use('/brands',routes.brandRoutr)
app.use('/products',routes.productRoutr)
app.use('/coupons',routes.couponRoutr)
app.use('/carts',routes.cartRoutr)
app.use('/orders',routes.ordertRoutr)






app.get('/', (req, res, next) => {
    res.sendFile(path.resolve('/index.html'));
});


app.get('*', (req, res,next) =>{
    return next(new AppError(`Invalid URL : ${req.originalUrl}`,404))
})

app.use(globalErrorHandling);

const PORT =  process.env.PORT||3000
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}!`))



}


export default initApp
