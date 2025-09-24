const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysql',
    database: 'nodejs_asm'
});

exports.admin = (req, res) => {
        res.render('Admin/home'); 
}

exports.adminProduct = (req, res) => {
    const keyword = req.query.keyword ? `%${req.query.keyword}%` : '%';
    const page = parseInt(req.query.page) || 1; 
    const limit = 10; 
    const offset = (page - 1) * limit; 

    let countQuery = `
        SELECT COUNT(*) AS total FROM products 
        LEFT JOIN categories ON products.categoryId = categories.categoryId
        WHERE products.title LIKE ? OR categories.categoryName LIKE ?
    `;

    db.query(countQuery, [keyword, keyword], (err, countResult) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Lỗi khi lấy số lượng sản phẩm');
        }

        const totalProducts = countResult[0].total;
        const totalPages = Math.ceil(totalProducts / limit); 

        let sql = `
            SELECT 
                products.productId,
                products.title,
                products.price,
                products.images,
                products.author,
                categories.categoryName
            FROM products
            LEFT JOIN categories ON products.categoryId = categories.categoryId
            WHERE products.title LIKE ? OR categories.categoryName LIKE ?
            LIMIT ? OFFSET ?
        `;

        db.query(sql, [keyword, keyword, limit, offset], (err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Lỗi khi lấy danh sách sản phẩm');
            }
            res.render('Admin/Pages/Product/product', { 
                products: data, 
                keyword: req.query.keyword || '', 
                currentPage: page,
                totalPages: totalPages 
            });
        });
    });
};



exports.getAddProduct = (req, res) => {
    let sql = "SELECT * FROM categories";
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Không thể lấy danh sách loại sản phẩm");
        }
        res.render("Admin/Pages/Product/create", {
            categories: results 
        });
    });
};


exports.createProduct = (req, res) => {
    if (req.body.shortDescription.length > 255) {
        return res.status(400).send("Mô tả ngắn quá dài, tối đa 255 ký tự.");
    }
    
    const file = req.file;
    const { title, author, categorie, publisher, publicationDate, price, shortDescription, description } = req.body;

    if (!file) {
        return res.status(400).send("Vui lòng tải lên ảnh sản phẩm.");
    }

    if (!title || !author || !categorie || !publisher || !publicationDate || !price || !shortDescription) {
        return res.status(400).send("Vui lòng điền đầy đủ thông tin sản phẩm.");
    }

    const filename = file.filename;
    const sql = `INSERT INTO products (title, author, categoryId, publisher, publicationDate, price, shortDescription, description, images) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [title, author, categorie, publisher, publicationDate, price, shortDescription, description, filename], (err, result) => {
        if (err) {
            console.error('Lỗi khi thêm sản phẩm:', err);
            return res.status(500).send("Lỗi khi thêm sản phẩm.");
        }
        res.redirect('/admin/products'); 
    });
};



exports.getEditProduct = (req, res) => {
    const productId = req.params.id;
    const productQuery = 'SELECT * FROM products WHERE productId = ?';
    const categoryQuery = 'SELECT * FROM categories WHERE status = 1';

    db.query(productQuery, [productId], (err, productResult) => {
        if (err) {
            console.error('Lỗi truy vấn sản phẩm:', err.message);
            return res.status(500).send('Lỗi khi truy vấn sản phẩm');
        }

        if (productResult.length === 0) {
            return res.status(404).send('Không tìm thấy sản phẩm');
        }

        const product = productResult[0];
        const publicationDate = new Date(product.publicationDate);
        product.publicationDate = publicationDate.toISOString().split('T')[0]; //2025-03-05T12:30:00.000Z

        db.query(categoryQuery, (err, categoryResult) => {
            if (err) {
                console.error('Lỗi truy vấn danh mục:', err.message);
                return res.status(500).send('Lỗi khi truy vấn danh mục');
            }

            res.render('Admin/Pages/Product/edit', {
                product: product,
                categories: categoryResult,
                currentImage: product.images 
            });
        });
    });
};



exports.editProduct = (req, res) => {
    if (req.body.shortDescription.length > 255) {
        return res.status(400).send("Mô tả ngắn quá dài, tối đa 255 ký tự.");
    }

    const productId = req.params.id;
    const file = req.file;
    const { title, author, categorie, publisher, publicationDate, price, shortDescription, description } = req.body;

    if (!title || !author || !categorie || !publisher || !publicationDate || !price || !shortDescription) {
        return res.status(400).send('Vui lòng điền đầy đủ thông tin sản phẩm.');
    }

    let sql = `
        UPDATE products 
        SET title = ?, author = ?, categoryId = ?, publisher = ?, publicationDate = ?, price = ?, shortDescription = ?, description = ?`;
    
    let values = [title, author, categorie, publisher, publicationDate, price, shortDescription, description];

    if (file) {
        sql += `, images = ?`;
        values.push(file.filename);
    }

    sql += ` WHERE productId = ?`;
    values.push(productId);

    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Lỗi khi cập nhật sản phẩm:', err);
            return res.status(500).send('Lỗi khi cập nhật sản phẩm.');
        }
        console.log('Cập nhật sản phẩm thành công.');
        res.redirect('/admin/products');
    });
};



exports.deleteProduct = (req, res) => {
        const id = req.params.id;
        const sql = "DELETE FROM products WHERE productId = ?";
        db.query(sql, [id], (err, result) => {
            if (err) {
                console.error('Lỗi khi xóa sản phẩm:', err);
                return res.status(500).send('Có lỗi xảy ra khi xóa sản phẩm.');
            }
            console.log(`Xóa sản phẩm có id = ${id} thành công.`);
            res.redirect('/admin/products');
        });
}
