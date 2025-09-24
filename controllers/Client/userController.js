const User = require("../../models/users");

exports.getProfile = async (req, res) => {
    if (!req.session.user) {
        return res.redirect("/login");
    }

    const userId = req.session.user.id;
    try {
        const user = await User.findOne({ where: { userId } });
        if (!user) {
            return res.status(404).send("Không tìm thấy người dùng.");
        }

        res.render("Client/Pages/User/user", { user });
    } catch (error) {
        console.error("Lỗi truy vấn user:", error);
        res.status(500).send("Lỗi lấy thông tin người dùng.");
    }
};


exports.updateProfile = async (req, res) => {
    const userId = req.session.user ? req.session.user.id : null;

    if (!userId) {
        return res.send("<script>alert('Bạn chưa đăng nhập!'); window.history.back();</script>");
    }

    const { name, email, phoneNumber, address } = req.body;
    let avatar = req.body.avatar; 

    if (req.file) {  
        avatar = req.file.filename; 
    }

    try {
        const [updated] = await User.update(
            { name, email, phoneNumber, address, avatar },
            { where: { userId } }
        );

        if (!updated) {
            return res.send("<script>alert('Không tìm thấy người dùng để cập nhật.'); window.history.back();</script>");
        }

        return res.send(`
            <script>
                alert('Cập nhật hồ sơ thành công!');
                window.location.href = '/users';
            </script>
        `);
    } catch (error) {
        console.error("Lỗi khi cập nhật hồ sơ:", error);
        return res.send("<script>alert('Có lỗi xảy ra khi cập nhật hồ sơ. Vui lòng thử lại.'); window.history.back();</script>");
    }
};
