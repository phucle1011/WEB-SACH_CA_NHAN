exports.validateLogin = (req, res, next) => {
    let errors = {};
    const name = req.body.name ? req.body.name.trim() : "";
    const password = req.body.password ? req.body.password.trim() : "";

    if (!name) errors.name = "Tên đăng nhập không được để trống.";
    if (!password) errors.password = "Mật khẩu không được để trống.";
    if (password.length < 6) errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";

    console.log("Lỗi validateLogin:", errors);

    if (Object.keys(errors).length > 0) {
        return res.render('Client/Pages/Auth/login', { 
            errors, 
            name,
            password
        });
    }

    next();
};
