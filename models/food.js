const mongoose = require('mongoose');

// Define Schemes
const FoodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        default: 0.0
    },
    kcal: {
        type: Number,
        required: false,
        default: 0.0
    },
    carbs: {
        type: Number,
        required: false,
        default: 0.0
    },
    sugar: {
        type: Number,
        required: false,
        default: 0.0
    },
    fat: {
        type: Number,
        required: false,
        default: 0.0
    },
    protein: {
        type: Number,
        required: false,
        default: 0.0
    },
    calcium: {
        type: Number,
        required: false,
        default: 0.0
    },
    phosphorus: {
        type: Number,
        required: false,
        default: 0.0
    },
    salt: {
        type: Number,
        required: false,
        default: 0.0
    },
    potassium: {
        type: Number,
        required: false,
        default: 0.0
    },
    magnesium: {
        type: Number,
        required: false,
        default: 0.0
    },
    iron: {
        type: Number,
        required: false,
        default: 0.0
    },
    zinc: {
        type: Number,
        required: false,
        default: 0.0
    },
    cholesterol: {
        type: Number,
        required: false,
        default: 0.0
    },
    trans_fat: {
        type: Number,
        required: false,
        default: 0.0
    }
});

// Create new food document
FoodSchema.statics.create = function (payload) {
    // this === Model
    const food = new this(payload);
    // return Promise
    return food.save();
};

// Find All
FoodSchema.statics.findAll = function () {
    // return promise
    // V4부터 exec() 필요없음
    return this.find({});
};

// Find One by foodName
FoodSchema.statics.findOneByfoodName = function (foodName) {
    return this.findOne({ name: foodName });
};

// Update by foodid
FoodSchema.statics.updateByfoodid = function (foodid, payload) {
    // { new: true }: return the modified document rather than the original. defaults to false
    return this.findOneAndUpdate({ foodid }, payload, { new: true });
};

// Delete by foodid
FoodSchema.statics.deleteByfoodid = function (foodid) {
    return this.remove({ name: foodid });
};

module.exports = mongoose.model('Food', FoodSchema);