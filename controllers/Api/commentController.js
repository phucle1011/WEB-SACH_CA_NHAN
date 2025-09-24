const commentModel = require('../../models/comments');


exports.home = (req, res, next) => {
    res.render('home');
}

exports.getAll = async (req, res, next) => {
    const data = await commentModel.findAll();
    res.json(data);
}

exports.detail = async (req, res, next) => {
    const comment = await commentModel.findByPk(req.params.id);
    res.json(comment);
}

exports.create = async (req, res, next) => {
    const data = req.body;
    const comment = await commentModel.create(data);
    res.json(comment);
}

exports.update = async (req, res, next) => {
    const data = req.body;

    const comment = await commentModel.update(
        data,
        {
            where: {
                commentId: req.params.id,
            },
        },
    );
    res.json(comment);
}

exports.delete = async (req, res, next) => {
    const comment = await commentModel.destroy({
        where: {
            commentId: req.params.id,
        },
    });
    res.json(comment);
}

