const { json } = require('express/lib/response');
const mongoose = require('mongoose');

// Define Schemes
const UserLogSchema = new mongoose.Schema({
    uid: {
        type: String,
        required: true,
    },
    dates: {
        type: Array,
    },
}, { versionKey: false });

// 전체 생성
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

// 로그의 날짜 생성
UserLogSchema.statics.createDate = function (userId, inputDate) {
    const payload = {
        date: inputDate,
        exercises: [],
        meals: [],
        diet_info: {}
    }

    return this.findOneAndUpdate({ uid: userId }, { $push: { dates: payload } }, { upsert: true });
};

// 운동 추가
UserLogSchema.statics.findOneAndUpdateExercise = function (userId, inputDate, payload) {
    return this.findOneAndUpdate(
        {
            $and: [
                { uid: userId },
                { 'dates.date': inputDate },
            ]
        },
        {
            $push: {
                "dates.$.exercises": payload
            }
        },
        { upsert: true }
    );
};

// 음식 추가
UserLogSchema.statics.findOneAndUpdateFood = function (userId, inputDate, payload) {
    return this.findOneAndUpdate(
        {
            $and: [
                { uid: userId },
                { 'dates.date': inputDate },
            ]
        },
        {
            $push: {
                "dates.$.meals": payload
            }
        },
        { upsert: true }
    );
};

// 음식 추가
UserLogSchema.statics.findOneAndUpdateFood = function (userId, inputDate, payload) {
    return this.findOneAndUpdate(
        {
            $and: [
                { uid: userId },
                { 'dates.date': inputDate },
            ]
        },
        {
            $push: {
                "dates.$.meals": payload
            }
        },
        { upsert: true }
    );
};
// 영양성분 추가
UserLogSchema.statics.findOneAndUpdateDietInfo = function (userId, inputDate, payload) {

    return this.findOneAndUpdate(
        {
            $and: [
                { uid: userId },
                { 'dates.date': inputDate },
            ]
        },
        {
            $set: {
                "dates.$.diet_info": payload
            }
        },
        { upsert: true }
    );
};

// 아침식사 이미지 추가
UserLogSchema.statics.findOneAndUpdateBreakfastImage = function (userId, inputDate, image) {

    return this.findOneAndUpdate(
        {
            $and: [
                { uid: userId },
                { 'dates.date': inputDate },
            ]
        },
        {
            $set: {
                "dates.$.breakfast_image": image
            }
        },
        { upsert: true }
    );
};


// 점심식사 이미지 추가
UserLogSchema.statics.findOneAndUpdateLunchImage = function (userId, inputDate, image) {

    return this.findOneAndUpdate(
        {
            $and: [
                { uid: userId },
                { 'dates.date': inputDate },
            ]
        },
        {
            $set: {
                "dates.$.lunch_image": image
            }
        },
        { upsert: true }
    );
};

// 저녁식사 이미지 추가
UserLogSchema.statics.findOneAndUpdateDinnerImage = function (userId, inputDate, image) {

    return this.findOneAndUpdate(
        {
            $and: [
                { uid: userId },
                { 'dates.date': inputDate },
            ]
        },
        {
            $set: {
                "dates.$.dinner_image": image
            }
        },
        { upsert: true }
    );
};

// Delete by UserId
UserLogSchema.statics.deleteByUserId = function (userId) {
    return this.remove({ uid: userId });
};

module.exports = mongoose.model('user_log', UserLogSchema);