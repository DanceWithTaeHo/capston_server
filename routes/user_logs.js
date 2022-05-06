const router = require('express').Router();
const userLog = require('../models/user_log');
const Food = require('../models/food');

// Find All
router.get('/', (req, res) => {
    userLog.findAll()
        .then((userLogs) => {
            if (!userLogs.length) return res.status(404).send({ err: 'userLogs not found' });
            res.send({ userLogs });
        })
        .catch(err => res.status(500).send(err));
});

// Find One by userid
router.get('/:userId', (req, res) => {
    userLog.findOneByUserId(req.params.userId)
        .then((userLog) => {
            if (!userLog) return res.status(404).send({ err: 'userLog not found' });
            res.send({ userLog });
        })
        .catch(err => res.status(500).send(err));
});

// 날짜 정보
router.get('/:userId/:date', (req, res) => {
    date = req.params.date;
    userLog.findOneByUserId(req.params.userId)
        .then((mUserLog) => {
            if (!mUserLog) return res.status(404).send({ err: 'userLog not found' });
            console.log(mUserLog.dates);
            dateLog = mUserLog.dates.find(v => v.date == date)
            res.send({ dateLog });
        })
        .catch(err => res.status(500).send(err));
});

// 날짜 정보
router.get('/:userId/dates', (req, res) => {
    date = req.params.date;
    userLog.findOneByUserId(req.params.userId)
        .then((mUserLog) => {
            if (!mUserLog) return res.status(404).send({ err: 'userLog not found' });
            dates = mUserLog.dates;
            res.send({ dates });
        })
        .catch(err => res.status(500).send(err));
});

// 해당 날짜의 운동 정보 조회
router.get('/:userId/:date/exercises', (req, res) => {
    date = req.params.date;
    userId = req.params.userId;
    userLog.findOneByUserId(userId)
        .then((mUserLog) => {
            if (!mUserLog) return res.status(404).send({ err: 'userLog not found' });
            exercises = mUserLog.dates.find(v => v.date == date).exercises
            res.send({ exercises });
        })
        .catch(err => res.status(500).send(err));
});

// 해당 날짜의 식사 정보 조회
router.get('/:userId/:date/meals', (req, res) => {
    date = req.params.date;
    userId = req.params.userId;
    userLog.findOneByUserId(userId)
        .then((mUserLog) => {
            if (!mUserLog) return res.status(404).send({ err: 'userLog not found' });
            meals = mUserLog.dates.find(v => v.date == date).meals
            res.send({ meals });
        })
        .catch(err => res.status(500).send(err));
});

// 해당 날짜의 식사 정보 종류별 조회
router.get('/:userId/:date/meals/:kind', (req, res) => {
    date = req.params.date;
    userId = req.params.userId;
    kind = req.params.kind;
    userLog.findOneByUserId(userId)
        .then((mUserLog) => {
            if (!mUserLog) return res.status(404).send({ err: 'userLog not found' });
            meals = [];

            mUserLog.dates.find(v => v.date == date)
                .meals.find((v) => {
                    if (v.kind == kind)
                        meals.push(v);
                });
            res.send({ meals });
        })
        .catch(err => res.status(500).send(err));
});

// 다이어트 정보 전송
router.get('/:userId/:date/dietInfo', (req, res) => {
    payload = req.body;
    date = req.params.date;
    userId = req.params.userId;
    userLog.findOneByUserId(userId)
        .then((mUserLog) => {
            mUserLog.dates.find((v) => {
                if (v.date == date) {
                    diet_info = v.diet_info;
                    res.send({ diet_info });
                }
            })
        }).catch(err => res.status(500).send(err))
});

// POST
//전체
router.post('/', (req, res) => {
    userLog.create(req.body)
        .then(userLog => res.send(userLog))
        .catch(err => res.status(500).send(err));
});

// 운동 정보 전송
router.post('/:userId/:date/exercises', (req, res) => {
    payload = req.body;
    date = req.params.date;
    userId = req.params.userId;

    checkAndMakeDate(userId, date);
    setTimeout(() => userLog.findOneAndUpdateExercise(userId, date, payload)
        .then((userLog) => {
            res.send({ userLog });
        }).catch(err => res.status(500).send(err)), 50);
});

// 음식 정보 전송
router.post('/:userId/:date/meals', (req, res) => {
    payload = req.body;
    date = req.params.date;
    userId = req.params.userId;
    diet_info = {};
    food = {};
    Food.findOneByfoodName(payload.food).then((mfood) => food = mfood).catch(err => console.log(err));
    checkAndMakeDate(userId, date);
    payload = addFoodinfo(food, payload)

    setTimeout(() => userLog.findOneAndUpdateFood(userId, date, payload)
        .then((mUserLog) => {
            mUserLog.dates.find((v) => {
                if (v.date == date) {
                    diet_info = v.diet_info;
                }
            });
            diet_payload = foodSizeCalculator(food, diet_info, payload.size);
            userLog.findOneAndUpdateDietInfo(userId, date, diet_payload)
                .then((mUserLog) => { res.send({ mUserLog }); })
                .catch(err => res.status(500).send(err));
        }).catch(err => res.status(500).send(err)), 50);
});



// Delete by userid
router.delete('/userid/:userId', (req, res) => {
    userLog.deleteByUserId(req.params.userId)
        .then(() => res.sendStatus(200))
        .catch(err => res.status(500).send(err));
});


function checkAndMakeDate(userId, date) {
    userLog.findOneByUserId(userId)
        .then((mUserLog) => {
            if (!mUserLog) return console.log("해당 유저가 없습니다.");
            if (!(mUserLog.dates.find(v => v.date == date))) {
                userLog.createDate(userId, date).catch(err => console.log(err));
            }
        }).catch(err => console.log(err));
}

function foodSizeCalculator(food, diet_info, size) {
    ratio = 1;
    diet_payload = {};

    switch (size) {
        case "small":
            ratio = 0.7;
            break;
        case "medium":
            ratio = 1;
            break;
        case "large":
            ratio = 1.3;
            break;
        default:
            break;
    }

    if (diet_info.intake_kcal != null) {
        payload = {
            "intake_kcal": ((food.kcal + diet_info.intake_kcal) * ratio).toFixed(2),
            "burned_kcal": ((diet_info.burned_kcal) * ratio).toFixed(2),
            "exercise_time": ((diet_info.exercise_time) * ratio).toFixed(2),
            "weight": ((diet_info.weight) * ratio).toFixed(2),
            "intake_carbs": ((food.carbs + diet_info.intake_carbs) * ratio).toFixed(2),
            "intake_protein": ((food.protein + diet_info.intake_protein) * ratio).toFixed(2),
            "intake_fat": ((food.fat + diet_info.intake_fat) * ratio).toFixed(2)
        }
    } else {
        payload = {
            "intake_kcal": food.kcal * ratio,
            "burned_kcal": 0,
            "exercise_time": 0,
            "weight": 0,
            "intake_carbs": food.carbs * ratio,
            "intake_protein": food.protein * ratio,
            "intake_fat": food.fat * ratio
        }
    }
    return payload
}

function addFoodinfo(food, payload) {
    payload.kcal = food.kcal
    payload.carbs = food.carbs
    payload.protein = food.protein
    payload.fat = food.fat

    return payload
}


module.exports = router;