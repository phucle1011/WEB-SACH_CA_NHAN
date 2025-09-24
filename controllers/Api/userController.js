const userModel = require('../../models/users');


exports.home = (req, res, next) => {
    res.render('home');
}

exports.getAll = async (req, res, next) => {
    const data = await userModel.findAll();
    res.json(data);
}

exports.detail = async (req, res, next) => {
    const user = await userModel.findByPk(req.params.id);
    res.json(user);
}

exports.create = async (req, res, next) => {
    const body = req.body;
    console.log(body);
    
    body.avatar = req.file.filename;
    const user = await userModel.create(body);
    res.json(user);
}

exports.update = async (req, res, next) => {
    const data = req.body;

    const user = await userModel.update(
        data,
        {
            where: {
                userId: req.params.id,
            },
        },
    );
    res.json(user);
}

exports.delete = async (req, res, next) => {
    const user = await userModel.destroy({
        where: {
            userId: req.params.id,
        },
    });
    res.json(user);
}

