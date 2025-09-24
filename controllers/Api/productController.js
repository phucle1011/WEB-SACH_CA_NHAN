const productModel = require('../../models/products');

exports.getAll = async (req, res, next) => {
    const data = await productModel.findAll();
    res.json(data);
};

exports.detail = async (req, res, next) => {
    const product = await productModel.findByPk(req.params.id);
    res.json(product);
};

exports.create = async (req, res, next) => {
    const body = req.body;
    body.images = req.file.filename;
    const product = await productModel.create(body);
    res.json(product);
};

exports.update = async (req, res, next) => {
    const file = req.file;
    const data = req.body;
    if (file) {
        data.image = file.filename;
    }

    const product = await productModel.update(data, {
        where: { productId : req.params.id },
    });

    res.json(product);
};

exports.delete = async (req, res, next) => {
    const product = await productModel.destroy({
        where: { productId : req.params.id },
    });

    res.json(product);
};
