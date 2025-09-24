const Product = require("../../models/products");

exports.getCart = async (req, res) => {
    try {
        let cart = req.cookies?.cart ? JSON.parse(req.cookies.cart) : [];

        for (let item of cart) {
            let product = await Product.findByPk(item.product_id); 
            if (!product) {
                continue;
            }
            product.price = parseFloat(product.price.replace(/\./g, '').replace(',', '.'));

            item.data = product;
        }
        res.render("Client/Pages/Cart/cart", { cart });
    } catch (error) {
        console.error("Lỗi khi lấy giỏ hàng:", error);
        res.status(500).send("Lỗi server");
    }
};


exports.addToCart = async (req, res) => {
    try {
        let cart = req.cookies?.cart ? JSON.parse(req.cookies.cart) : []; 

        const { product_id } = req.body;

        if (!product_id) {
            return res.status(400).send("Thiếu product_id");
        }

        let product = await Product.findByPk(product_id);
        if (!product) {
            return res.status(400).send("Sản phẩm không tồn tại.");
        }

        let item = cart.find((item) => item.product_id === product_id);
        if (item) {
            item.quantity += 1;
        } else {
            cart.push({ 
                product_id, 
                quantity: 1, 
                data: {
                    title: product.title,  
                    price: product.price,  
                    images: product.images 
                } 
            });
        }
        res.cookie("cart", JSON.stringify(cart), { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
        res.redirect("/cart");
    } catch (error) {
        console.error("Lỗi khi thêm vào giỏ hàng:", error);
        res.status(500).send("Lỗi server");
    }
};




exports.updateCart = (req, res) => {
    let cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
    const { product_id, quantity } = req.body;

    cart = cart.map((item) => {
        if (item.product_id === product_id) {
            return { ...item, quantity: parseInt(quantity) };
        }
        return item;
    });

    res.cookie("cart", JSON.stringify(cart), { maxAge: 30 * 24 * 60 * 60 * 1000 });
    res.redirect("/cart");
};


exports.deleteItem = (req, res) => {
    let cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
    const { product_id } = req.body;

    cart = cart.filter((item) => item.product_id !== product_id);

    res.cookie("cart", JSON.stringify(cart), { maxAge: 30 * 24 * 60 * 60 * 1000 });
    res.redirect("/cart");
};


exports.clearCart = (req, res) => {
    res.clearCookie("cart");
    res.redirect("/cart");
};


exports.renderCheckout = async (req, res) => {
    const isLogin = req.session.user ? true : false;
    let cart = req.cookies?.cart ? JSON.parse(req.cookies.cart) : [];

    let detailedCart = [];
    let totalPrice = 0;

    for (let item of cart) {
        let product = await Product.findByPk(item.product_id);
        if (product) {
            let unitPrice = item.quantity * product.price;
            totalPrice += unitPrice;
            detailedCart.push({
                product_id: item.product_id,
                name: product.title,  
                price: product.price,
                quantity: item.quantity,
                total: unitPrice,
            });
        }
    }

    res.render("Client/Pages/Cart/checkout", {
        cart: detailedCart,
        isLogin,
        totalPrice,
        checkout_info: req.session.checkout_info || {},
    });
};



exports.handleCheckout = (req, res) => {
    const cart = req.session.cart || [];
    if (cart.length === 0) {
        return res.redirect("/cart");
    }

    
    req.session.checkout_info = {
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        address: req.body.address,
        description: req.body.description,
    };

    
    req.session.cart = [];

    res.redirect("/checkout/success");
};
