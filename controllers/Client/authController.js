const express = require('express');
const app = express();
const User = require('../../models/users'); 
const bcrypt = require('bcryptjs');
require("dotenv").config();
const nodemailer = require("nodemailer");
const session = require("express-session");

app.use(session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 10 * 60 * 1000 } 
}));


exports.register = async (req, res) => {
    try {
        const { email, password, name, phoneNumber, address, avatar } = req.body; 

        if (!email || !password || !name) { 
            return res.send("<script>alert('Vui lòng điền đầy đủ thông tin'); window.history.back();</script>");
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.send("<script>alert('Email đã tồn tại'); window.history.back();</script>");
        }

        const hashedPassword = await bcrypt.hash(password, 12); 

        const newUser = await User.create({
            name, 
            email,
            password: hashedPassword, 
            phoneNumber: phoneNumber?.trim() || "",
            address: address?.trim() || "",
            avatar: avatar?.trim() || ""
        });

        return res.send("<script>alert('Tạo tài khoản thành công'); window.location.href='/login';</script>");
    } catch (error) {
        console.error("Lỗi trong quá trình đăng ký:", error);
        return res.send("<script>alert('Đã xảy ra lỗi, vui lòng thử lại sau'); window.history.back();</script>");
    }
};

exports.login = async (req, res) => {
    try {
        const { name, password } = req.body;

        const user = await User.findOne({ where: { name } });

        if (!user) {
            return res.send("<script>alert('Tên đăng nhập không tồn tại'); window.history.back();</script>");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.send("<script>alert('Mật khẩu không chính xác'); window.history.back();</script>");
        }

        req.session.user = {
            id: user.userId,
            name: user.name,
            email: user.email
        };

        return res.send(`
            <script>
                alert('Đăng nhập thành công');
                window.location.href = '/';
            </script>
        `);

    } catch (error) {
        console.error("Lỗi trong quá trình đăng nhập:", error);
        res.status(500).send("Đã xảy ra lỗi, vui lòng thử lại sau.");
    }
};




exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Lỗi khi đăng xuất:", err);
        }
        res.redirect("/login");
    });
};


exports.forgot = async (req, res) => {
    res.render('Client/Pages/Auth/forgotPassword');
}

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.send("<script>alert('Vui lòng nhập email.'); window.history.back();</script>");
    }

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.send("<script>alert('Email không tồn tại.'); window.history.back();</script>");
        }

        const otp = Math.floor(100000 + Math.random() * 900000);
        req.session.otp = { email, code: otp, expire: Date.now() + 10 * 60 * 1000 }; 

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {  
            to: email,
            subject: "Mã xác thực đặt lại mật khẩu",
            html: `<p>Bạn đã yêu cầu đặt lại mật khẩu.</p>
                   <p>Mã OTP của bạn là: <strong>${otp}</strong></p>
                   <p>Mã này có hiệu lực trong 10 phút.</p>`,
        };
        
        await transporter.sendMail(mailOptions);
        return res.render("Client/Pages/Auth/OTPPassword", { email });
    } catch (error) {
        console.error("Lỗi trong quá trình quên mật khẩu:", error);
        return res.send("<script>alert('Lỗi server. Vui lòng thử lại sau.'); window.history.back();</script>");
    }
};


exports.OTP = (req, res) => {
    const { email, otp } = req.body;
    const storedOtp = req.session.otp;

    if (!storedOtp || storedOtp.email !== email || storedOtp.code != otp || Date.now() > storedOtp.expire) {
        return res.send("<script>alert('Mã OTP không hợp lệ hoặc đã hết hạn.'); window.history.back();</script>");
    }

    delete req.session.otp;

    return res.render("Client/Pages/Auth/resetPassword", { email });
};

exports.reset = async (req, res) => {
    res.render('Client/Pages/Auth/resetPassword');
}

exports.resetPassword = async (req, res) => {
    const { email, password, re_password } = req.body;

    if (!email || !password || !re_password) {
        return res.send("<script>alert('Vui lòng nhập đầy đủ thông tin.'); window.history.back();</script>");
    }

    if (password !== re_password) {
        return res.send("<script>alert('Mật khẩu không khớp. Vui lòng nhập lại.'); window.history.back();</script>");
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 12);

        await User.update(
            { password: hashedPassword },
            { where: { email } }
        );

        return res.send("<script>alert('Mật khẩu đã được cập nhật thành công.'); window.location.href='/login';</script>");
    } catch (error) {
        console.error("Lỗi khi đặt lại mật khẩu:", error);
        return res.send("<script>alert('Lỗi server. Vui lòng thử lại sau.'); window.history.back();</script>");
    }
};