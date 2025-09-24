const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysql',
    database: 'nodejs_asm'
});


exports.client = (req, res) => {
    let listProduct = [];
    let sql = "SELECT * FROM products";
    db.query(sql, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Có lỗi khi lấy danh sách sản phẩm');
        }
        listProduct = data;
        res.render('Client/home', { listProduct: listProduct });
    });
};


exports.clientProduct = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const offset = (page - 1) * limit;

    const countQuery = `SELECT COUNT(*) AS total FROM products`;
    db.query(countQuery, (err, countResult) => {
        if (err) {
            console.error('Lỗi khi lấy số lượng sản phẩm:', err);
            return res.status(500).send('Có lỗi khi lấy danh sách sản phẩm.');
        }

        const totalProducts = countResult[0]?.total || 0;
        const totalPages = Math.ceil(totalProducts / limit) || 1;

        const sql = `SELECT * FROM products LIMIT ? OFFSET ?`;
        db.query(sql, [limit, offset], (err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Có lỗi khi lấy danh sách sản phẩm.');
            }

            res.render('Client/Pages/Product/product', {
                products: data,
                currentPage: page,
                totalPages: totalPages
            });
        });
    });
};

exports.clientProductDetail = (req, res) => {
    const productId = req.params.id;

    db.query('SELECT * FROM products WHERE productId = ?', [productId], (err, results) => {
        if (err) {
            console.error('Lỗi truy vấn MySQL:', err.message);
            return res.status(500).send('Hệ thống đang gặp sự cố, vui lòng thử lại sau.');
        }

        if (results.length === 0) {
            return res.status(404).send('Không tìm thấy sản phẩm.');
        }

        const product = results[0];

        db.query('SELECT comments.content, comments.createdAt, comments.updatedAt, users.name AS userName FROM comments JOIN users ON comments.userId = users.userId WHERE comments.productId = ? ORDER BY comments.createdAt DESC', [productId], (err, commentsResults) => {
            if (err) {
                console.error('Lỗi truy vấn MySQL:', err.message);
                return res.status(500).send('Hệ thống đang gặp sự cố khi lấy bình luận.');
            }

            commentsResults.forEach(comment => {
                comment.createdAt = new Date(comment.createdAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
                comment.updatedAt = new Date(comment.updatedAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
            });

            db.query('SELECT ratings.rating, ratings.createdAt, users.name AS userName FROM ratings JOIN users ON ratings.userId = users.userId WHERE ratings.productId = ? ORDER BY ratings.createdAt DESC', [productId], (err, ratingsResults) => {
                if (err) {
                    console.error('Lỗi truy vấn MySQL:', err.message);
                    return res.status(500).send('Hệ thống đang gặp sự cố khi lấy đánh giá.');
                }

                const averageRating = ratingsResults.length > 0 ? ratingsResults.reduce((sum, rating) => sum + rating.rating, 0) / ratingsResults.length : 0;

                const totalRatings = ratingsResults.length;

                ratingsResults.forEach(rating => {
                    rating.createdAt = new Date(rating.createdAt).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
                });

                res.render('Client/Pages/Product/product_detai', {
                    product,
                    comments: commentsResults,
                    ratings: ratingsResults,
                    averageRating: averageRating.toFixed(1),
                    totalRatings,  
                    user: req.session.user || null
                });
            });
        });
    });
};


exports.addComment = (req, res) => {
    const productId = parseInt(req.params.id, 10);
    const { comment } = req.body;

    if (isNaN(productId) || !comment) {
        return res.status(400).send('Yêu cầu không hợp lệ.');
    }

    const userId = req.session.user ? req.session.user.id : null;

    if (!userId) {
        return res.send('<script>alert("Vui lòng đăng nhập để bình luận."); window.location.href = "/login";</script>');
    }

    const currentDateTime = new Date(new Date().getTime() + (7 * 60 * 60 * 1000)).toISOString().slice(0, 19).replace('T', ' ');

    db.query('INSERT INTO comments (userId, productId, content, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
        [userId, productId, comment, currentDateTime, currentDateTime], (error, results) => {
            if (error) {
                console.error("Lỗi khi thêm bình luận:", error);
                return res.status(500).send('Hệ thống đang gặp sự cố.');
            }

            res.send(`
                <script>
                    alert("Bình luận đã được thêm thành công.");
                    window.location.href = '/product/${productId}';
                </script>
            `);
        });
};

exports.addRating = (req, res) => {
    const userId = req.session.user ? req.session.user.id : null; 
    const productId = parseInt(req.params.id, 10);

    if (!userId) {
        return res.send('<script>alert("Vui lòng đăng nhập để đánh giá sản phẩm."); window.location.href = "/login";</script>');
    }

    const rating = req.body.rating;
    if (!rating || rating < 1 || rating > 5) {
        return res.send('<script>alert("Đánh giá phải là một số từ 1 đến 5."); window.location.href = "/product/' + productId + '";</script>');
    }

    db.query('SELECT order_details.product_id FROM orders JOIN order_details ON orders.id = order_details.order_id WHERE orders.user_id = ? AND order_details.product_id = ? AND orders.status IN ("Hoàn thành", "Đã giao hàng thành công")', [userId, productId], (error, results) => {
        if (error) {
            console.error("Lỗi khi kiểm tra đơn hàng:", error);
            return res.status(500).send('Hệ thống đang gặp sự cố.');
        }
        if (results.length === 0) {
            return res.send('<script>alert("Bạn phải mua sản phẩm này trước khi đánh giá."); window.location.href = "/product/' + productId + '";</script>');
        }

        db.query('SELECT * FROM ratings WHERE userId = ? AND productId = ?', [userId, productId], (error, results) => {
            if (error) {
                console.error("Lỗi khi kiểm tra đánh giá:", error);
                return res.status(500).send('Hệ thống đang gặp sự cố.');
            }

            if (results.length > 0) {
                return res.send('<script>alert("Bạn đã đánh giá rồi!"); window.location.href = "/product/' + productId + '";</script>');
            }

            const currentDateTime = new Date(new Date().getTime() + (7 * 60 * 60 * 1000)).toISOString().slice(0, 19).replace('T', ' ');

            db.query('INSERT INTO ratings (userId, productId, rating, createdAt) VALUES (?, ?, ?, ?)', [userId, productId, rating, currentDateTime], (error, results) => {
                if (error) {
                    console.error("Lỗi khi thêm đánh giá:", error);
                    return res.status(500).send('Hệ thống đang gặp sự cố.');
                }

                res.send(`
                    <script>
                        alert("Đánh giá đã được thêm thành công.");
                        window.location.href = '/product/${productId}';
                    </script>
                `);
            });
        });
    });
};

exports.clientContact = (req, res) => {
    res.render("Client/Pages/Contact/contact");
}

exports.clientBlog = (req, res) => {
    res.render('Client/Pages/Blog/blog');
}

exports.clientIntroduction = (req, res) => {
    res.render('Client/Pages/Introduction/introduction');
}


exports.clientRegister = (req, res) => {
    res.render('Client/Pages/Auth/register');
}

exports.clientOrder = (req, res) => {
    res.render('Client/Pages/Order/order');
}

exports.searchProducts = (req, res) => {
    const query = req.query.query || "";
    const sql = "SELECT * FROM products WHERE title LIKE ?";
    db.query(sql, [`%${query}%`], (err, results) => {
        if (err) {
            console.error("Lỗi tìm kiếm sản phẩm:", err);
            return res.status(500).send("Lỗi khi tìm kiếm sản phẩm.");
        }

        res.render("Client/Pages/Product/product", {
            products: results,
            currentPage: 1,
            totalPages: 1
        });
    });
};


exports.filterByPrice = (req, res) => {
    let minPrice = 0;
    let maxPrice = 999999999; 

    if (req.query.priceRange) {
        const priceParts = req.query.priceRange.split("-"); 
        minPrice = parseFloat(priceParts[0]) || 0;
        maxPrice = parseFloat(priceParts[1]) || 999999999;
    }

    const sql = "SELECT * FROM products WHERE price BETWEEN ? AND ?";
    db.query(sql, [minPrice, maxPrice], (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Lỗi khi lọc sản phẩm theo giá');
        }
        res.render('Client/Pages/Product/product', {
            products: data,
            currentPage: 1,
            totalPages: 1
        });
    });
};



exports.clientLogin = (req, res) => {
    res.render('Client/Pages/Auth/login', { user: req.session.user || null });
};

exports.clientLoginPost = (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT * FROM users WHERE username = ?";
    db.query(sql, [username], (err, results) => {
        if (err) return res.status(500).send("Lỗi hệ thống.");

        if (results.length === 0) return res.status(401).send("Sai tên đăng nhập hoặc mật khẩu.");

        const user = results[0];

        bcrypt.compare(password, user.password, (err, match) => {
            if (match) {
                req.session.user = user;
                return res.redirect("/");
            } else {
                return res.status(401).send("Sai tên đăng nhập hoặc mật khẩu.");
            }
        });
    });
};

