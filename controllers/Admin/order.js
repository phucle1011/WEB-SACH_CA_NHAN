const mysql = require("mysql2");
const moment = require('moment-timezone');
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "mysql",
    database: "nodejs_asm",
});


exports.adminOrder = (req, res) => {
    const keyword = req.query.keyword ? `%${req.query.keyword}%` : '%';
    const page = parseInt(req.query.page) || 1; 
    const limit = 10; 
    const offset = (page - 1) * limit; 

    
    const countQuery = `SELECT COUNT(*) AS total FROM orders 
                        JOIN users ON orders.user_id = users.userId
                        WHERE users.name LIKE ? OR orders.status LIKE ?`;

    db.query(countQuery, [keyword, keyword], (err, countResult) => {
        if (err) {
            console.error('Lỗi khi lấy số lượng đơn hàng:', err);
            return res.status(500).send('Có lỗi khi lấy danh sách đơn hàng.');
        }

        const totalOrders = countResult[0].total;
        const totalPages = Math.ceil(totalOrders / limit); 

        
        const sql = `
        SELECT orders.id, users.name AS customer_name, orders.total_price, 
               orders.status, DATE_FORMAT(orders.created_at, '%d-%m-%Y %H:%i:%s') AS created_at
        FROM orders
        JOIN users ON orders.user_id = users.userId
        WHERE users.name LIKE ? OR orders.status LIKE ?
        ORDER BY orders.created_at DESC
        LIMIT ? OFFSET ?`;

        db.query(sql, [keyword, keyword, limit, offset], (err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Có lỗi khi lấy danh sách đơn hàng.');
            }
            res.render("Admin/Pages/Order/order", { 
                orders: data, 
                keyword: req.query.keyword || '', 
                currentPage: page, 
                totalPages: totalPages 
            });
        });
    });
};


exports.updateOrderStatus = (req, res) => {
    const orderId = req.params.id;
    const newStatus = req.body.status;

    let sql = `UPDATE orders SET status = ? WHERE id = ?`;

    db.query(sql, [newStatus, orderId], (err, result) => {
        if (err) {
            console.error(err);
            return res.json({ success: false, message: "Lỗi khi cập nhật trạng thái đơn hàng!" });
        }
        res.json({ success: true, message: "Cập nhật trạng thái thành công!" });
    });
};


exports.cancelOrder = (req, res) => {
    const orderId = req.params.id;

    let sql = `DELETE FROM orders WHERE id = ? AND status = 'Chờ xác nhận'`;

    db.query(sql, [orderId], (err, result) => {
        if (err) {
            console.error(err);
            return res.json({ success: false, message: "Lỗi khi hủy đơn hàng!" });
        }
        if (result.affectedRows === 0) {
            return res.json({ success: false, message: "Chỉ có thể hủy đơn ở trạng thái 'Chờ xác nhận'!" });
        }
        res.json({ success: true, message: "Đã hủy và xóa đơn hàng thành công!" });
    });
};

exports.viewOrderDetail = (req, res) => {
    const orderId = req.params.id;

    const orderDetailsSql = `
        SELECT 
            orders.id AS order_id, 
            orders.total_price, 
            orders.status, 
            orders.created_at, 
            orders.name, 
            orders.phone, 
            orders.address, 
            orders.email, 
            orders.payment_method_id, 
            products.title AS product_name, 
            order_details.quantity
        FROM orders
        JOIN order_details ON orders.id = order_details.order_id
        JOIN products ON order_details.product_id = products.productId
        WHERE orders.id = ?`;

    db.query(orderDetailsSql, [orderId], (err, orderDetails) => {
        if (err) {
            console.error('Lỗi khi truy vấn chi tiết đơn hàng:', err);
            return res.status(500).send('Có lỗi khi lấy thông tin đơn hàng.');
        }

        if (orderDetails.length === 0) {
            return res.status(404).send('Không tìm thấy đơn hàng');
        }

        const createdAtVN = moment(orderDetails[0].created_at)
            .tz("Asia/Ho_Chi_Minh")
            .format("DD/MM/YYYY HH:mm:ss");

        const customerInfo = {
            order_id: orderDetails[0].order_id,
            name: orderDetails[0].name,
            phone: orderDetails[0].phone,
            address: orderDetails[0].address,
            email: orderDetails[0].email,
            payment_method: orderDetails[0].payment_method_id,
            created_at: createdAtVN
        };

        res.render('Admin/Pages/Order/order_detail', {
            orderDetails: orderDetails,
            customer: customerInfo
        });
    });
};

exports.orderHistory = (req, res) => {
    const keyword = req.query.keyword ? `%${req.query.keyword}%` : '%';
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;

    const countQuery = `
        SELECT COUNT(*) AS total 
        FROM orders 
        JOIN users ON orders.user_id = users.userId
        WHERE orders.status = 'Hoàn thành' 
        AND (users.name LIKE ? OR users.email LIKE ?)
    `;

    db.query(countQuery, [keyword, keyword], (err, countResult) => {
        if (err) {
            console.error("Lỗi khi lấy số lượng đơn hàng:", err);
            return res.status(500).send("Lỗi khi lấy lịch sử đơn hàng.");
        }

        const totalOrders = countResult[0]?.total || 0;
        const totalPages = Math.ceil(totalOrders / limit);

        if (totalOrders === 0) {
            return res.render("Admin/Pages/Order/history", {
                message: "Không tìm thấy đơn hàng nào."
            });
        }

        const sql = `
            SELECT orders.id, orders.total_price, orders.status, 
                   DATE_FORMAT(orders.created_at, '%d-%m-%Y %H:%i:%s') AS created_at,
                   users.name AS user_name, users.email AS user_email
            FROM orders
            JOIN users ON orders.user_id = users.userId
            WHERE orders.status = 'Hoàn thành'
            AND (users.name LIKE ? OR users.email LIKE ?)
            ORDER BY orders.created_at DESC
            LIMIT ? OFFSET ?
        `;

        db.query(sql, [keyword, keyword, limit, offset], (err, data) => {
            if (err) {
                console.error("Lỗi khi truy vấn đơn hàng:", err);
                return res.status(500).send("Lỗi khi lấy lịch sử đơn hàng.");
            }

            res.render("Admin/Pages/Order/history", {
                orders: data,
                keyword: req.query.keyword || '',
                currentPage: page,
                totalPages: totalPages
            });
        });
    });
};




exports.viewUserOrderDetail = (req, res) => {
    const orderId = req.params.id;

    const orderDetailsSql = `
        SELECT 
            orders.id AS order_id, 
            orders.total_price, 
            orders.status, 
            orders.created_at, 
            orders.name, 
            orders.phone, 
            orders.address, 
            orders.email, 
            orders.payment_method_id, 
            products.title AS product_name, 
            order_details.quantity
        FROM orders
        JOIN order_details ON orders.id = order_details.order_id
        JOIN products ON order_details.product_id = products.productId
        WHERE orders.id = ?`;

    db.query(orderDetailsSql, [orderId], (err, orderDetails) => {
        if (err) {
            console.error('Lỗi khi truy vấn chi tiết đơn hàng:', err);
            return res.status(500).send('Có lỗi khi lấy thông tin đơn hàng.');
        }

        if (orderDetails.length === 0) {
            return res.status(404).send('Không tìm thấy đơn hàng');
        }

        const createdAtVN = moment(orderDetails[0].created_at)
            .tz("Asia/Ho_Chi_Minh")
            .format("DD/MM/YYYY HH:mm:ss");

        const customerInfo = {
            order_id: orderDetails[0].order_id,
            name: orderDetails[0].name,
            phone: orderDetails[0].phone,
            address: orderDetails[0].address,
            email: orderDetails[0].email,
            total_price: orderDetails[0].total_price,
            payment_method: orderDetails[0].payment_method_id,
            created_at: createdAtVN
        };

        res.render('Admin/Pages/Order/history_detail', {
            orderDetails: orderDetails,
            customer: customerInfo
        });
    });
};


