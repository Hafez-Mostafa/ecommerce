import cors from 'cors';
import path from 'path'
import dotenv from 'dotenv';

dotenv.config({path:path.resolve('config/.env')});

import AppError from '../utils/AppError.js';
import  {globalErrorHandling}  from '../utils/errorHandling.js';
import  {deleteFromCloudinary}  from '../utils/deleteFromCloudinary.js';
import  {deleteFromDB}  from '../utils/deleteFromDB.js';

import  connectionDB  from '../db/connectionDB.js';
import * as  routes from '../src/modules/index.routes.js';


const initApp = (app,express) => {



app.use(cors());
connectionDB()
app.use(express())
app.use((req,res,next)=>{
    if(req.originalUrl == '/orders/webhook'){
next()
    }else{
        express.json()(req,res,next)
    }
});

app.use(express.static(path.resolve('public')));
app.use('/users',routes.userRouter)
app.use('/categories',routes.categoryRouter)
app.use('/subCategories',routes.subCategoryRouter)
app.use('/brands',routes.brandRouter)
app.use('/products',routes.productRouter)
app.use('/coupons',routes.couponRouter)
app.use('/carts',routes.cartRouter)
app.use('/orders',routes.ordertRouter)
app.use('/reviews',routes.reviewtRouter)
app.use('/wishLists',routes.wishListRouter)








app.get('/', (req, res, next) => {
    res.sendFile(path.resolve('/index.html'));
});


app.get('*', (req, res,next) =>{
    return next(new AppError(`Invalid URL : ${req.originalUrl}`,404))
})



app.use(globalErrorHandling,deleteFromCloudinary,deleteFromDB);
// Integration with Error Handling Middleware to delete from Cloudinary
// app.use((err, req, res, next) => {
//     if (req?.filePath) {
//         deleteFromCloudinary(req, res, () => {
//             res.status(err.statusCode || 500).json({
//                 status: 'error',
//                 message: err.message || 'An unexpected error occurred',
//             });
//         });
//     } else {
//         res.status(err.statusCode || 500).json({
//             status: 'error',
//             message: err.message || 'An unexpected error occurred',
//         });
//     }
// });

const PORT =  process.env.PORT||3001
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}!`))}


export default initApp
