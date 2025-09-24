const orderDetailModel = require('../../models/orderDetail');


exports.home = (req, res, next) => {
    res.render('home');
}

exports.getAll = async (req, res, next) => {
    const data = await orderDetailModel.findAll();
    res.json(data);
}

exports.detail = async (req, res, next) => {
    const orderDetail = await orderDetailModel.findByPk(req.params.id);
    res.json(orderDetail);
}

exports.create = async (req, res, next) => {
    const data = req.body;
    const orderDetail = await orderDetailModel.create(data);
    res.json(orderDetail);
}

exports.update = async (req, res, next) => {
    const data = req.body;

    const orderDetail = await orderDetailModel.update(
        data,
        {
            where: {
                id: req.params.id,
            },
        },
    );
    res.json(orderDetail);
}

exports.delete = async (req, res, next) => {
    const orderDetail = await orderDetailModel.destroy({
        where: {
            id: req.params.id,
        },
    });
    res.json(orderDetail);
}

