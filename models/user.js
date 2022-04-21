const mongoose = require('mongoose');

// Define Schemes
const UserSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    body_form: {
        type: String,
        required: true,
    },
    weight: {
        type: Number,
        required: true,
    },
    height: {
        type: Number,
        required: true,
    },
}, { versionKey: false });

// Create new food document
UserSchema.statics.create = function (payload) {
    // this === Model
    const user = new this(payload);

    return this.findOneAndUpdate({ uid: user.uid }, payload, { upsert: true });
};

// Find All
UserSchema.statics.findAll = function () {
    // return promise
    // V4부터 exec() 필요없음
    return this.find({});
};

// Find One by foodName
UserSchema.statics.findOneByUserId = function (userId) {
    return this.findOne({ uid: userId });
};

// Update by UserId
UserSchema.statics.updateByUserId = function (userId, payload) {
    // { new: true }: return the modified document rather than the original. defaults to false
    return this.findOneAndUpdate({ userId }, payload, { new: true });
};

// Delete by UserId
UserSchema.statics.deleteByUserId = function (userId) {
    return this.deleteOne({ uid: userId });
};

module.exports = mongoose.model('User', UserSchema);