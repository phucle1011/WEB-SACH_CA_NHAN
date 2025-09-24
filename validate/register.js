const validator = require('validator');

exports.validateRegister = (req, res, next) => {
    let errors = {};
    const name = req.body.name ? req.body.name.trim() : "";
    const email = req.body.email ? req.body.email.trim() : "";
    const password = req.body.password ? req.body.password.trim() : "";
    const re_password = req.body.re_password ? req.body.re_password.trim() : "";

    if (!name) errors.name = "Tên đăng nhập không được để trống.";
    if (!email || !validator.isEmail(email)) errors.email = "Email không hợp lệ.";
    if (!password) errors.password = "Mật khẩu không được để trống.";
    if (password.length < 6) errors.password = "Mật khẩu phải có ít nhất 6 ký tự.";
    if (password !== re_password) errors.re_password = "Mật khẩu nhập lại không khớp.";

    console.log("Lỗi validateRegister:", errors);

    if (Object.keys(errors).length > 0) {
        return res.render('Client/Pages/Auth/register', { 
            errors, 
            name, 
            email 
        });
    }

    next();
};
