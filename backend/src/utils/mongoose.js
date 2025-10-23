module.exports = {
    mutipleObject: function (mongooseArray) {
        return mongooseArray.map(mongoose => mongoose.toObject())
    },
    onlyObject: function (mongoose){
        return mongoose ? mongoose.toObject() : mongoose
    }
}