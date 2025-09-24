const mysql = require('mysql2');  

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysql', 
    database: 'nodejs_asm'
});


exports.getComments = (req, res) => {
    const keyword = req.query.keyword ? `%${req.query.keyword}%` : '%';
    const page = parseInt(req.query.page) || 1; 
    const limit = 10; 
    const offset = (page - 1) * limit; 

    const countQuery = `SELECT COUNT(*) AS total FROM comments WHERE content LIKE ?`;

    db.query(countQuery, [keyword], (err, countResult) => {
        if (err) {
            console.error('Lỗi khi lấy số lượng bình luận:', err);
            return res.status(500).send('Có lỗi khi lấy bình luận.');
        }

        const totalComments = countResult[0].total;
        const totalPages = Math.ceil(totalComments / limit); 

        
        const sql = `
        SELECT commentId, content, 
        DATE_FORMAT(comments.createdAt, '%d-%m-%Y %H:%i:%s') AS createdAt, 
        productId 
        FROM comments 
        WHERE content LIKE ? 
        ORDER BY comments.createdAt DESC 
        LIMIT ? OFFSET ?`;

        db.query(sql, [keyword, limit, offset], (err, comments) => {
            if (err) {
                console.error('Lỗi khi lấy bình luận:', err);
                return res.status(500).send('Có lỗi khi lấy bình luận.');
            }
            res.render('Admin/Pages/Comment/comment', { 
                comments: comments, 
                keyword: req.query.keyword || '', 
                currentPage: page, 
                totalPages: totalPages 
            });
        });
    });
};



exports.getCommentDetail = (req, res) => {
    const commentId = req.params.id;

    const sql = "SELECT commentId, content, DATE_FORMAT(comments.createdAt, '%d-%m-%Y %H:%i:%s') AS createdAt,DATE_FORMAT(comments.updatedAt, '%d-%m-%Y %H:%i:%s') AS updatedAt, productId FROM comments WHERE commentId = ?";
    db.query(sql, [commentId], (err, comment) => {
        if (err) {
            console.error('Lỗi khi lấy chi tiết bình luận:', err);
            return res.status(500).send('Có lỗi khi lấy chi tiết bình luận.');
        }
        if (comment.length === 0) {
            return res.status(404).send('Bình luận không tồn tại.');
        }
        res.render('Admin/Pages/Comment/detail', { comment: comment[0] });
    });
};

exports.deleteComment = (req, res) => {
    const commentId = req.params.id;

    db.query("DELETE FROM comments WHERE commentId = ?", [commentId], (err, result) => {
        if (err) {
            return res.status(500).send("Lỗi xóa bình luận");
        }
        if (result.affectedRows === 0) {
            return res.status(404).send("Bình luận không tồn tại");
        }
        res.redirect("/admin/comments");
    });
};