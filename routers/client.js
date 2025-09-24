const express = require('express');
const app = express();
const clientController = require('../controllers/Client/clientController');
const orderController = require("../controllers/Client/orderController");
const mailController = require('../controllers/Client/mailController');
const cartController = require('../controllers/Client/cartController');
const authController = require('../controllers/Client/authController');
const userController = require('../controllers/Client/userController');
const {validateRegister} = require ('../validate/register');
const {validateLogin} = require ('../validate/login');
const router = express.Router();

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/assets'); 
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); 
    }
});

var upload = multer({ storage: storage });

const isAuthenticated = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }
    next();
};


router.get('/', (req, res, next) => { res.locals.user = req.session.user || null; next(); }, clientController.client);
router.get('/products', clientController.clientProduct);
router.get('/product/:id', clientController.clientProductDetail);
router.post('/product/:id/comment', clientController.addComment);
router.post('/product/:id/rate', clientController.addRating);

router.get('/contact', clientController.clientContact);
router.get('/blog', clientController.clientBlog);
router.get('/introduction', clientController.clientIntroduction);



router.post("/send-email", mailController.mail);

router.get("/search", clientController.searchProducts);

router.get('/products/filter', clientController.filterByPrice);

router.get("/cart", cartController.getCart);
router.post("/cart/add", cartController.addToCart);
router.post("/cart/update", cartController.updateCart);
router.post("/cart/delete", cartController.deleteItem);
router.post("/cart/clear", cartController.clearCart);
router.get("/checkout", cartController.renderCheckout);
router.post("/checkout", cartController.handleCheckout);


router.get('/register', validateRegister, clientController.clientRegister);
router.post('/register', validateRegister, authController.register);



router.get('/login', validateLogin, clientController.clientLogin);
router.post("/login", validateLogin, authController.login);
router.get("/logout", authController.logout);
router.get("/forgot-password", authController.forgot);
router.post("/forgot-password", authController.forgotPassword);
router.post("/otp", authController.OTP);
router.get("/reset-password", authController.reset);
router.post("/reset-password", authController.resetPassword);

router.get("/users", isAuthenticated, userController.getProfile);
router.post("/users/update", isAuthenticated, upload.single('avatar'), userController.updateProfile);

router.post('/orders', orderController.createOrder);
router.get('/orderUser', orderController.getUserOrders);
router.post('/orders/delete/:id', orderController.deleteOrder);
router.post('/orders/confirm-completion/:id', orderController.confirmCompletion);


module.exports = router;
