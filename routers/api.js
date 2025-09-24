const express = require('express');
const router = express.Router();
const categoryController = require ('../controllers/Api/categoryController');
const productController = require ('../controllers/Api/productController');
const commentsController = require ('../controllers/Api/commentController');
// const usersController = require ('../controllers/api/userController');
const ordersController = require ('../controllers/Api/orderController');
const orderDetailController = require ('../controllers/Api/orderDetailController');
const upload = require('../config/upload');


router.get('/', categoryController.home);
router.get('/categories', categoryController.getAll);
router.get('/categories/:id', categoryController.detail);
router.post('/categories', upload.single('image'), categoryController.create);
router.put('/categories/:id', upload.single('image'), categoryController.update);
router.patch('/categories/:id', categoryController.update);
router.delete('/categories/:id', categoryController.delete);

router.get('/products', productController.getAll);
router.get('/products/:id', productController.detail);
router.post('/products', upload.single('image'), productController.create);
router.put('/products/:id', upload.single('image'), productController.update);
router.patch('/products/:id', productController.update);
router.delete('/products/:id', productController.delete);

router.get('/comments', commentsController.getAll);
router.get('/comments/:id', commentsController.detail);
router.post('/comments', commentsController.create);
router.put('/comments/:id', commentsController.update);
router.patch('/comments/:id', commentsController.update);
router.delete('/comments/:id', commentsController.delete);

// router.get('/users', usersController.getAll);
// router.get('/users/:id', usersController.detail);
// router.post('/users', upload.single('avatar'), usersController.create);
// router.put('/users/:id', upload.single('avatar'), usersController.update);
// router.patch('/users/:id', usersController.update);
// router.delete('/users/:id', usersController.delete);

router.get('/orders', ordersController.getAll);
router.get('/orders/:id', ordersController.detail);
router.post('/orders', ordersController.create);
router.put('/orders/:id', ordersController.update);
router.patch('/orders/:id', ordersController.update);
router.delete('/orders/:id', ordersController.delete);

router.get('/order_detail', orderDetailController.getAll);
router.get('/order_detail/:id', orderDetailController.detail);
router.post('/order_detail', orderDetailController.create);
router.put('/order_detail/:id', orderDetailController.update);
router.patch('/order_detail/:id', orderDetailController.update);
router.delete('/order_detail/:id', orderDetailController.delete);


module.exports = router;