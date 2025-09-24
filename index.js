const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const multer = require('multer');

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const session = require('express-session');

app.use(session({
    secret: "mySecretKey",  
    resave: false,           
    saveUninitialized: false, 
    cookie: { secure: false, maxAge: 1000 * 60 * 60 } 
}));


app.use((req, res, next) => {
    res.locals.user = req.session.user || null; 
    next();
});


app.set('view engine', 'ejs');
app.set('views', './src/Views'); 
app.use(express.static('public/assets/')); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
 
app.use('/uploads', express.static('public/assets/'));

const adminRouter = require("./routers/admin");
app.use("/admin", adminRouter);

const apiRouter = require("./routers/api");
app.use("/api", apiRouter);

const clientRouter = require("./routers/client");
app.use("/", clientRouter);


app.listen(5000, function () {
    console.log('Web đang chạy: http://localhost:5000');
});
