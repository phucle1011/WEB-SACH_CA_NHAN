const orderModel = require('../../models/orders');


exports.home = (req, res, next) => {
    res.render('home');
}

exports.getAll = async (req, res, next) => {
    const data = await orderModel.findAll();
    res.json(data);
}

exports.detail = async (req, res, next) => {
    const order = await orderModel.findByPk(req.params.id);
    res.json(order);
}

exports.create = async (req, res, next) => {
    const data = req.body;
    const order = await orderModel.create(data);
    res.json(order);
}

exports.update = async (req, res, next) => {
    const data = req.body;

    const order = await orderModel.update(
        data,
        {
            where: {
                id: req.params.id,
            },
        },
    );
    res.json(order);
}

exports.delete = async (req, res, next) => {
    const order = await orderModel.destroy({
        where: {
            id: req.params.id,
        },
    });
    res.json(order);
}

