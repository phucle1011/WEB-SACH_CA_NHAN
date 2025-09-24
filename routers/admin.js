const express = require('express');
const productsController = require('../controllers/Admin/product');
const categoryController = require('../controllers/Admin/category');
const homeController = require('../controllers/Admin/home');
const userController = require('../controllers/Admin/user');
const commentController = require('../controllers/Admin/comment');
const orderController = require('../controllers/Admin/order');
const router = express.Router();
const multer = require('multer');
const app = express();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/assets'); 
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname); 
    }
});

var upload = multer({ storage: storage });

router.get('/', homeController.adminStats);
router.get('/products', productsController.adminProduct);
router.get('/products/create', productsController.getAddProduct);
router.post('/products/create', upload.single('file'), productsController.createProduct); 
router.get('/products/edit/:id', productsController.getEditProduct); 
router.post('/products/edit/:id', upload.single('file'), productsController.editProduct); 
router.post('/products/delete/:id', upload.single('file'), productsController.deleteProduct); 
router.get('/categories', categoryController.categories);
router.get('/categories/create', categoryController.categoryCreate);
router.post('/categories/create', categoryController.categoryCreate);
router.get('/categories/edit/:id', categoryController.getEditCategory);
router.post('/categories/edit/:id', categoryController.editCategory);   
router.post('/categories/delete/:id', categoryController.categoryDelete);

router.get('/users', userController.adminUser);
router.get("/users/create", userController.showAddUserForm);
router.post("/users/create", userController.createUser);
router.get('/users/edit/:id', userController.getEditUser);
router.post('/users/edit/:id', userController.editUser);   
router.post('/users/delete/:id', userController.deleteUser);
router.get('/users/detail/:id', userController.viewUserDetail);


router.get('/orders', orderController.adminOrder);
router.post("/orders/update/:id", orderController.updateOrderStatus);
router.post("/orders/cancel/:id", orderController.cancelOrder);
router.get('/orders/detail/:id', orderController.viewOrderDetail);   

router.get('/comments', commentController.getComments);
router.post("/comments/delete/:id", commentController.deleteComment);
router.get('/comments/detail/:id', commentController.getCommentDetail);

router.get('/orders/history', orderController.orderHistory);
router.get('/orders/history/:id', orderController.viewUserOrderDetail);

module.exports = router;
