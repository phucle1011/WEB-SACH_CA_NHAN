require("dotenv").config();
const nodemailer = require("nodemailer");
const emailLimit = {};

const sendEmail = async (email, name, message) => {
    try {
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        let mailOptions = {
            from: `"${name}" <${email}>`,
            to: process.env.EMAIL_USER,
            subject: `Liên hệ từ: ${name}`,
            html: `<p><strong>Liên hệ từ:</strong> ${email}</p>
                   <p><strong>Tên người gửi:</strong> ${name}</p>
                   <p><strong>Nội dung:</strong></p>
                   <p>${message}</p>`,
        };

        let info = await transporter.sendMail(mailOptions);
        return { success: true, message: "Email đã được gửi thành công!" };
    } catch (error) {
        console.error("Lỗi gửi email:", error);
        return { success: false, message: "Gửi email thất bại." };
    }
};

exports.mail = async (req, res) => {
    const { email, name, message } = req.body;
    
    if (!email || !name || !message) {
        return res.json({ success: false, message: "Vui lòng nhập đầy đủ thông tin." });
    }

    const today = new Date().toISOString().split("T")[0]; 
    const key = `${email}-${today}`;

    if (!emailLimit[key]) {
        emailLimit[key] = 0;
    }

    if (emailLimit[key] >= 3) {
        return res.json({ success: false, message: "Bạn chỉ có thể gửi tối đa 3 email mỗi ngày." });
    }

    const result = await sendEmail(email, name, message);

    if (result.success) {
        emailLimit[key]++;
    }

    res.json(result);
};
