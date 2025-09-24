const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'mysql',
    database: 'nodejs_asm'
});

exports.adminStats = async (req, res) => {
    try {
        const [[{ total: totalUser }]] = await db.query("SELECT COUNT(*) as total FROM users");
        const [[{ total: totalCategory }]] = await db.query("SELECT COUNT(*) as total FROM categories");
        const [[{ total: totalProduct }]] = await db.query("SELECT COUNT(*) as total FROM products");
        const [[{ total: totalComment }]] = await db.query("SELECT COUNT(*) as total FROM comments");

        res.render("admin/home", { 
            totalUser,
            totalCategory,
            totalProduct,
            totalComment,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Lỗi server");
    }
};
