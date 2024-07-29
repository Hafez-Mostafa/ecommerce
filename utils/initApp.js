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

    

// Add headers middleware
// app.use((req, res, next) => {
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, cdn-loop, cf-connecting-ip, cf-ew-via, cf-ipcountry, cf-ray, cf-visitor, cf-worker, render-proxy-ttl, rndr-id, true-client-ip, x-forwarded-for, x-forwarded-proto, x-request-start");
//     next();
// });
// app.use((req, res, next) => {
//     // List of headers to remove
//     const headersToRemove = [
//         'cdn-loop', 'cf-connecting-ip', 'cf-ew-via', 'cf-ipcountry',
//         'cf-ray', 'cf-visitor', 'cf-worker', 'render-proxy-ttl',
//         'rndr-id', 'true-client-ip', 'x-forwarded-for', 
//         'x-forwarded-proto', 'x-request-start'
//     ];
//     headersToRemove.forEach(header => {
//         delete req.headers[header];
//     });
//     next();
// });


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

const PORT =  process.env.PORT||3000
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}!`))



}


export default initApp
