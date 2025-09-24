const { Op } = require("sequelize");
const Order = require('../../models/orders');
const OrderDetail = require('../../models/orderDetail');
const Product = require('../../models/products');
const mysql = require('mysql2');
const crypto = require("crypto");
const axios = require("axios");
require("dotenv").config();
const nodemailer = require("nodemailer");


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysql',
    database: 'nodejs_asm',
})


exports.createOrder = async (req, res) => {
    try {
        let cart = req.cookies?.cart ? JSON.parse(req.cookies.cart) : [];

        if (cart.length === 0) {
            return res.status(400).json({ message: 'Giỏ hàng của bạn đang trống.' });
        }

        let detailedCart = [];
        let totalPrice = 0;
        for (let item of cart) {
            let product = await Product.findByPk(item.product_id);
            if (!product) {
                return res.status(400).json({ message: `Sản phẩm ID ${item.product_id} không tồn tại.` });
            }

            let price = parseFloat(product.price.replace(/\./g, '').replace(',' , '.'));

            detailedCart.push({
                product_id: item.product_id,
                name: product.title,
                price: price,
                quantity: item.quantity,
                total: price * item.quantity,
            });

            totalPrice += price * item.quantity;
        }

        const user_id = req.session.user ? req.session.user.id : null;

        if (!user_id) {
            return res.status(400).json({ message: 'Bạn cần đăng nhập để tạo đơn hàng.' });
        }

        const { name, phone, email, address, payment_method_id } = req.body;

        const currentDateTime = new Date(new Date().getTime() + (7 * 60 * 60 * 1000)); 

        const newOrder = await Order.create({
            name,
            phone,
            email,  
            address,
            total_price: totalPrice,
            user_id,
            status: 'Chờ xác nhận',
            payment_method_id,
            created_at: currentDateTime, 
        });

        const orderDetails = detailedCart.map(item => ({
            order_id: newOrder.id,
            product_id: item.product_id,
            quantity: item.quantity,
            price: item.price,
        }));

        await OrderDetail.bulkCreate(orderDetails);

        await sendOrderConfirmationEmail(newOrder, email, currentDateTime);  

        res.clearCookie('cart');

        return res.send(`
            <script>
                alert('Đã đặt hàng thành công. Cảm ơn bạn đã ủng hộ!');
                window.location.href = '/products';
            </script>
        `);
    } catch (error) {
        console.error("Lỗi khi tạo đơn hàng:", error.message);
        res.status(500).send(`Đã xảy ra lỗi khi tạo đơn hàng: ${error.message}`);
    }
};

const sendOrderConfirmationEmail = async (order, customerEmail, currentDateTime) => {
    try {
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const currentDateTimeUTC = new Date(currentDateTime.getTime() - (7 * 60 * 60 * 1000));

        const formattedDate = currentDateTimeUTC.toLocaleString("vi-VN", { hour12: false });

        const formattedPrice = new Intl.NumberFormat('vi-VN').format(order.total_price);

        const emailContent = `
            <h3>Cảm ơn bạn đã đặt hàng!</h3>
            <p><strong>Thông tin đơn hàng:</strong></p>
            <p><strong>Mã đơn hàng:</strong> ${order.id}</p>
            <p><strong>Ngày tạo:</strong> ${formattedDate}</p>
            <p><strong>Tổng tiền:</strong> ${formattedPrice} VND</p>
            <p><strong>Thông tin giao hàng:</strong></p>
            <p><strong>Họ tên:</strong> ${order.name}</p>
            <p><strong>Số điện thoại:</strong> ${order.phone}</p>
            <p><strong>Địa chỉ:</strong> ${order.address}</p>
            <p>Cảm ơn bạn đã ủng hộ chúng tôi!</p>
        `;

        let mailOptions = {
            from: `"Cửa hàng của chúng tôi" <${process.env.EMAIL_USER}>`,
            to: customerEmail, 
            subject: `Xác nhận đơn hàng #${order.id}`,
            html: emailContent,
        };

        let info = await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error("Lỗi gửi email xác nhận đơn hàng:", error);
    }
};


exports.getUserOrders = async (req, res) => {
    try {
        const userId = req.session.user ? req.session.user.id : null;

        if (!userId) {
            return res.send(`
                <script>
                    alert('Bạn phải đăng nhập để xem đơn hàng.');
                    window.location.href = '/login';
                </script>
            `);
        }

        db.query(
            'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId], (err, orders) => {
                if (err) {
                    console.error('Lỗi khi lấy đơn hàng:', err.message);
                    return res.status(500).send('Đã xảy ra lỗi khi tải đơn hàng của bạn.');
                }

                if (orders.length === 0) {
                    console.log("Không tìm thấy đơn hàng nào cho user_id:", userId);
                    return res.render('Client/Pages/Order/orderUser', { orders: [], message: "Bạn chưa có đơn hàng nào." });
                }

                const orderIds = orders.map(order => order.id);
                db.query(
                    'SELECT * FROM order_details WHERE order_id IN (?)', [orderIds], (err, orderDetails) => {
                        if (err) {
                            console.error('Lỗi khi lấy chi tiết đơn hàng:', err.message);
                            return res.status(500).send('Đã xảy ra lỗi khi tải chi tiết đơn hàng.');
                        }

                        orders.forEach(order => {
                            order.details = orderDetails.filter(detail => detail.order_id === order.id);
                        });

                        res.render('Client/Pages/Order/orderUser', { 
                            orders: orders
                        });
                        
                    }
                );
            }
        );
    } catch (error) {
        console.error('Lỗi khi lấy đơn hàng:', error.message);
        res.status(500).send('Đã xảy ra lỗi khi tải đơn hàng của bạn.');
    }
};

exports.confirmCompletion = async (req, res) => {
    try {
        const orderId = req.params.id;

        const [result] = await db.promise().query(
            'UPDATE orders SET status = ? WHERE id = ?',
            ['Đã giao hàng thành công', orderId]
        );

        res.send(`
            <script>
                alert("Đơn hàng đã giao thành công!");
                window.location.href = "/orderUser";
            </script>
        `);
    } catch (error) {
        console.error("Lỗi khi cập nhật trạng thái đơn hàng:", error);

        res.send(`
            <script>
                alert("Đã có lỗi xảy ra!");
                window.location.href = "/orderUser";
            </script>
        `);
    }
};



exports.deleteOrder = async (req, res) => {
    const orderId = req.params.id;

    let sql = `DELETE FROM orders WHERE id = ? AND status = 'Chờ xác nhận'`;

    db.query(sql, [orderId], (err, result) => {
        if (err) {
            console.error(err);
            return res.send(`
                <script>
                    alert('Lỗi khi hủy đơn hàng!');
                    window.location.href = '/orderUser';
                </script>
            `);
        }

        if (result.affectedRows === 0) {
            return res.send(`
                <script>
                    alert('Chỉ có thể hủy đơn ở trạng thái "Chờ xác nhận"!');
                    window.location.href = '/orderUser';
                </script>
            `);
        }

        return res.send(`
            <script>
                alert('Đã hủy đơn hàng thành công!');
                window.location.href = '/orderUser';
            </script>
        `);
    });
};