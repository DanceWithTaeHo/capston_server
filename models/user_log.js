const mongoose = require('mongoose');

// Define Schemes
const UserLogSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
    },
    date: {
        type: JSON,
    },
}, { versionKey: false });

// Create new food document
UserLogSchema.statics.create = function (payload) {
    // this === Model
    const userLog = new this(payload);

    return this.findOneAndUpdate({ uid: userLog.uid }, payload, { upsert: true });
};

// Find All
UserLogSchema.statics.findAll = function () {
    // return promise
    // V4부터 exec() 필요없음
    return this.find({});
};

// Find One by foodName
UserLogSchema.statics.findOneByUserId = function (userId) {
    return this.findOne({ uid: userId });
};

// Update by UserId
UserLogSchema.statics.updateByUserId = function (userId, payload) {
    // { new: true }: return the modified document rather than the original. defaults to false
    return this.findOneAndUpdate({ userId }, payload, { new: true });
};

// Delete by UserId
UserLogSchema.statics.deleteByUserId = function (userId) {
    return this.remove({ uid: userId });
};

module.exports = mongoose.model('user_log', UserLogSchema);