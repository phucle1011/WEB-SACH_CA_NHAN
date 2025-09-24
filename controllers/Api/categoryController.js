const categoryModel = require('../../models/categories');


exports.home = (req, res, next) => {
    res.render('home');
}

exports.getAll = async (req, res, next) => {
    const data = await categoryModel.findAll();
    res.json(data);
}

exports.detail = async (req, res, next) => {
    // FinByPK là phương thức dùng để lấy ra  đơn vị dữ liệu
    const category = await categoryModel.findByPk(req.params.id);
    res.json(category);
}

exports.create = async (req, res, next) => {
    const data = req.body;
    const category = await categoryModel.create(data);
    res.json(category);
}

exports.update = async (req, res, next) => {
    const data = req.body;
    const category = await categoryModel.update(
        data,
        {
            where: {
                categoryId: req.params.id,
            },
        },
    );
    res.json(category);
}

exports.delete = async (req, res, next) => {
    const category = await categoryModel.destroy({
        where: {
            categoryId: req.params.id,
        },
    });
    res.json(category);
}

