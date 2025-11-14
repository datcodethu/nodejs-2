const Joi = require('joi'); // phải viết hoa "Joi"

const validationUser = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(50).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        role: Joi.string().valid('user', 'admin').optional(),
    });
    return schema.validate(data);
};

const validationUpdateUser = (data) => {
    const schema = Joi.object({
        name: Joi.string().min(2).max(50).optional(),
        email: Joi.string().email().optional(),
        role: Joi.string().valid('user', 'admin').optional(),
    });
    return schema.validate(data);
};

module.exports = {
    validationUser,
    validationUpdateUser
};
