const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysql',
    database: 'nodejs_asm'
});


exports.adminUser = (req, res) => {
    const keyword = req.query.keyword ? `%${req.query.keyword}%` : '%';
    const page = parseInt(req.query.page) || 1;
    const limit = 10; 
    const offset = (page - 1) * limit; 

    let countQuery = `SELECT COUNT(*) AS total FROM users WHERE name LIKE ? OR email LIKE ?`;

    db.query(countQuery, [keyword, keyword], (err, countResult) => {
        if (err) {
            console.error("Lỗi khi lấy số lượng người dùng:", err);
            return res.status(500).send("Có lỗi khi lấy danh sách người dùng");
        }

        const totalUsers = countResult[0].total;
        const totalPages = Math.ceil(totalUsers / limit); 

        
        let sql = `SELECT userId, name, email, phoneNumber, address, createdAt, role 
                   FROM users 
                   WHERE name LIKE ? OR email LIKE ? 
                   ORDER BY createdAt DESC 
                   LIMIT ? OFFSET ?`;

        db.query(sql, [keyword, keyword, limit, offset], (err, data) => {
            if (err) {
                console.error("Lỗi khi lấy danh sách người dùng:", err);
                return res.status(500).send("Có lỗi khi lấy danh sách người dùng");
            }
            res.render('Admin/Pages/User/user', { 
                users: data, 
                keyword: req.query.keyword || '', 
                currentPage: page,
                totalPages: totalPages 
            });
        });
    });
};


exports.viewUserDetail = (req, res) => {
    const userId = req.params.id;
    const sql = "SELECT userId, name, email, phoneNumber, address, DATE_FORMAT(users.createdAt, '%d-%m-%Y %H:%i:%s') AS createdAt, role FROM users WHERE userId = ? ";

    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error('Lỗi khi truy vấn chi tiết người dùng:', err);
            return res.status(500).send('Có lỗi khi lấy thông tin người dùng.');
        }

        if (result.length === 0) {
            return res.status(404).send('Không tìm thấy người dùng');
        }

        const user = result[0];
        res.render('Admin/Pages/User/detail', { user: user });
    });
};


exports.showAddUserForm = (req, res) => {
    let sql = "SELECT * FROM users";
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Không thể lấy danh sách users");
        }
        res.render("Admin/Pages/User/create", {
            categories: results
        });
    });
};

exports.createUser = (req, res) => {
    const { name, email, password, phoneNumber, address, role } = req.body;

    if (!name || !email || !password || !phoneNumber || !address || !role) {
        return res.status(400).send("Vui lòng điền đầy đủ thông tin người dùng.");
    }

    const sql = `INSERT INTO users (name, email, password, phoneNumber, address, role) 
                 VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(sql, [name, email, password, phoneNumber, address, role], (err, result) => {
        if (err) {
            console.error('Lỗi khi thêm người dùng:', err);
            return res.status(500).send("Lỗi khi thêm người dùng.");
        }
        console.log('Thêm mới người dùng thành công');
        res.redirect('/admin/users');
    });
};

exports.getEditUser = (req, res) => {
    const userId = req.params.id;
    const userQuery = 'SELECT * FROM users WHERE userId = ?';

    db.query(userQuery, [userId], (err, userResult) => {
        if (err) {
            console.error('Lỗi truy vấn người dùng:', err.message);
            return res.status(500).send('Lỗi khi truy vấn người dùng');
        }

        if (userResult.length === 0) {
            return res.status(404).send('Không tìm thấy người dùng');
        }

        res.render('Admin/Pages/User/edit', {
            user: userResult[0]
        });
    });
};

exports.editUser = (req, res) => {
    const userId = req.params.id;
    const { name, email, password, phoneNumber, address, role } = req.body;

    if (!name || !email || !phoneNumber || !address || !role) {
        return res.status(400).send('Vui lòng điền đầy đủ thông tin người dùng.');
    }

    let sql;
    let params;

    if (password) {
        sql = `UPDATE users SET name = ?, email = ?, password = ?, phoneNumber = ?, address = ?, role = ? WHERE userId = ?`;
        params = [name, email, password, phoneNumber, address, role, userId];
    } else {
        sql = `UPDATE users SET name = ?, email = ?, phoneNumber = ?, address = ?, role = ? WHERE userId = ?`;
        params = [name, email, phoneNumber, address, role, userId];
    }

    db.query(sql, params, (err, result) => {
        if (err) {
            console.error('Lỗi khi cập nhật người dùng:', err);
            return res.status(500).send('Lỗi khi cập nhật người dùng.');
        }
        console.log('Cập nhật người dùng thành công.');
        res.redirect('/admin/users');
    });
};

exports.deleteUser = (req, res) => {
    const userId = req.params.id;
    const sql = "DELETE FROM users WHERE userId = ?";

    db.query(sql, [userId], (err, result) => {
        if (err) {
            console.error('Lỗi khi xóa người dùng:', err);
            return res.status(500).send('Có lỗi xảy ra khi xóa người dùng.');
        }
        console.log(`Xóa người dùng có id = ${userId} thành công.`);
        res.redirect('/admin/users');
    });
};

