const validationUser = (data) => {
    const schema = joi.object({
        name: joi.string().min(2).max(50).required(),
        email: joi.string().email().required(),
        password: joi.string().min(6).required(),
        role: joi.string().valid('user', 'admin').optional(),
    })

    return schema.validate(data)
}

const validationUpdateUser = (data) => {
    const schema = joi.object({
        name: joi.string().min(2).max(50).optional(),
        email: joi.string().email().optional(),
        role: joi.string().valid('user', 'admin').optional(),
    })

    return schema.validate(data)
}