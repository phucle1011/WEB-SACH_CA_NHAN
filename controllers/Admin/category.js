const mysql = require('mysql2');


const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysql',
    database: 'nodejs_asm'
});

exports.categories = (req, res) => {
    const keyword = req.query.keyword ? `%${req.query.keyword}%` : '%';
    const page = parseInt(req.query.page) || 1; 
    const limit = 10; 
    const offset = (page - 1) * limit; 

    let countQuery = "SELECT COUNT(*) AS total FROM categories WHERE categoryName LIKE ?";

    db.query(countQuery, [keyword], (err, countResult) => {
        if (err) {
            console.error("Lỗi khi lấy số lượng danh mục:", err);
            return res.status(500).send("Có lỗi khi lấy danh mục");
        }

        const totalCategories = countResult[0].total;
        const totalPages = Math.ceil(totalCategories / limit); 

        let sql = "SELECT * FROM categories WHERE categoryName LIKE ? LIMIT ? OFFSET ?";

        db.query(sql, [keyword, limit, offset], (err, data) => {
            if (err) {
                console.error("Lỗi khi lấy danh mục:", err);
                return res.status(500).send("Có lỗi khi lấy danh mục");
            }
            res.render('Admin/Pages/Category/category', { 
                categories: data, 
                keyword: req.query.keyword || '', 
                currentPage: page,
                totalPages: totalPages 
            });
        });
    });
};



exports.categoryCreate = (req, res) => {
    const { categoryName, status } = req.body;

    if (!categoryName || !status) {
        return res.status(400).render('Admin/Pages/Category/create', {
            error: 'Vui lòng điền đầy đủ thông tin bắt buộc!',
        });
    }

    const sql = "INSERT INTO categories (categoryName, status) VALUES (?, ?)";
    db.query(sql, [categoryName, status], (err) => {
        if (err) {
            console.error("Lỗi khi thêm loại sản phẩm:", err);
            return res.status(500).render('Admin/Pages/Category/create', {
                error: 'Có lỗi xảy ra khi thêm loại sản phẩm, vui lòng thử lại!',
            });
        }
        res.redirect('/admin/categories');
    });
};



exports.getEditCategory = (req, res) => {
    const categoryId = req.params.id;
    let sql = "SELECT * FROM categories WHERE categoryId = ?";
    
    db.query(sql, [categoryId], (err, result) => {
        if (err) {
            console.error('Lỗi khi lấy danh mục:', err);
            return res.status(500).send('Có lỗi xảy ra khi lấy danh mục.');
        }

        if (result.length === 0) {
            return res.status(404).send('Không tìm thấy danh mục');
        }

        const category = result[0];
        res.render('Admin/Pages/Category/edit', { category: category });
    });
};


exports.editCategory = (req, res) => {
    const { categoryName, status } = req.body;
    const categoryId = req.params.id;

    if (!categoryName || !status) {
        return res.status(400).render('Admin/Pages/Category/edit', {
            category: req.body, 
            error: 'Vui lòng điền đầy đủ thông tin bắt buộc!'
        });
    }

    let sql = "UPDATE categories SET categoryName = ?, status = ? WHERE categoryId = ?";
    db.query(sql, [categoryName, status, categoryId], (err, result) => {
        if (err) {
            console.error('Lỗi khi cập nhật danh mục:', err);
            return res.status(500).send('Có lỗi xảy ra khi cập nhật danh mục.');
        }
        res.redirect('/admin/categories');
    });
};

exports.categoryDelete = (req, res) => {
        const id = req.params.id;
        const sql = "DELETE FROM categories WHERE categoryId = ?";
        db.query(sql, [id], (err, result) => {
            if (err) {
                console.error('Lỗi khi xóa loại sản phẩm:', err);
                return res.status(500).send('Có lỗi xảy ra khi xóa loại sản phẩm.');
            }
            console.log(`Xóa loại sản phẩm có id = ${id} thành công.`);
            res.redirect('/admin/categories'); 
        });
}