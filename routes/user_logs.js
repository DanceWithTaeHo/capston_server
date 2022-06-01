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

    if (payload.time != 0) {
        payload = aerobicCalculator(payload);
    } else {
        payload = kcalCalculator(payload);
    }

    checkAndMakeDate(userId, date);
    setTimeout(() => userLog.findOneAndUpdateExercise(userId, date, payload)
        .then((mUserLog) => {
            mUserLog.dates.find((v) => {
                if (v.date == date) {
                    diet_info = v.diet_info;
                    diet_payload = exerciseCalculator(payload, diet_info);
                }
            });
            userLog.findOneAndUpdateDietInfo(userId, date, diet_payload)
                .then((mUserLog) => {
                    msg = mUserLog.uid + "의 운동정보를 성공적으로 추가하였습니다."
                    res.send({ msg });
                })
                .catch(err => res.status(500).send(err));
        }).catch(err => res.status(500).send(err)), 50);
});

// 음식 정보 전송
router.post('/:userId/:date/meals', (req, res) => {
    payload = req.body;
    date = req.params.date;
    userId = req.params.userId;
    diet_info = {};
    food = {};
    Food.findOneByfoodName(payload.food).then((mfood) => {
        food = mfood
        payload = addFoodinfo(food, payload)
    }).catch(err => console.log(err));

    checkAndMakeDate(userId, date);
    setTimeout(() => userLog.findOneAndUpdateFood(userId, date, payload)
        .then((mUserLog) => {
            mUserLog.dates.find((v) => {
                if (v.date == date) {
                    diet_info = v.diet_info;
                    diet_payload = foodSizeCalculator(food, diet_info, payload.gram);
                }
            });
            userLog.findOneAndUpdateDietInfo(userId, date, diet_payload)
                .then((mUserLog) => {
                    msg = mUserLog.uid + "의 음식정보를 성공적으로 추가하였습니다."
                    res.send({ msg });
                })
                .catch(err => res.status(500).send(err));
        }).catch(err => res.status(500).send(err)), 50);
});


// 음식 정보 전송
router.post('/:userId/:date/image', (req, res) => {
    payload = req.body;
    date = req.params.date;
    userId = req.params.userId;
    image = payload.image
    checkAndMakeDate(userId, date);

    if (payload.kind == "breakfast") {
        setTimeout(() => userLog.findOneAndUpdateBreakfastImage(userId, date, image)
            .then((mUserLog) => {
                msg = mUserLog.uid + "의 사진 정보를 성공적으로 추가하였습니다."
                res.send({ msg });
            })
            .catch(err => res.status(500).send(err)), 50);
    } else if (payload.kind == "lunch") {
        setTimeout(() => userLog.findOneAndUpdateLunchImage(userId, date, image)
            .then((mUserLog) => {
                msg = mUserLog.uid + "의 사진 정보를 성공적으로 추가하였습니다."
                res.send({ msg });
            })
            .catch(err => res.status(500).send(err)), 50);
    } else if (payload.kind == "dinner") {
        setTimeout(() => userLog.findOneAndUpdateDinnerImage(userId, date, image)
            .then((mUserLog) => {
                msg = mUserLog.uid + "의 사진 정보를 성공적으로 추가하였습니다."
                res.send({ msg });
            })
            .catch(err => res.status(500).send(err)), 50);
    }
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

function foodSizeCalculator(food, diet_info, gram) {
    if (diet_info.intake_kcal != null && diet_info.burned_kcal != null) {
        payload = {
            "intake_kcal": ((food.kcal * gram) + Number(diet_info.intake_kcal)).toFixed(2),
            "burned_kcal": (diet_info.burned_kcal),
            "exercise_time": 0,
            "weight": 0,
            "intake_carbs": ((food.carbs * gram) + Number(diet_info.intake_carbs)).toFixed(2),
            "intake_protein": ((food.protein * gram) + Number(diet_info.intake_protein)).toFixed(2),
            "intake_fat": ((food.fat * gram) + Number(diet_info.intake_fat)).toFixed(2)
        }
    } else if (diet_info.intake_kcal != null && diet_info.burned_kcal == null) {
        payload = {
            "intake_kcal": ((food.kcal * gram) + Number(diet_info.intake_kcal)).toFixed(2),
            "burned_kcal": 0,
            "exercise_time": 0,
            "weight": 0,
            "intake_carbs": ((food.carbs * gram) + Number(diet_info.intake_carbs)).toFixed(2),
            "intake_protein": ((food.protein * gram) + Number(diet_info.intake_protein)).toFixed(2),
            "intake_fat": ((food.fat * gram) + Number(diet_info.intake_fat)).toFixed(2)
        }
    } else if (diet_info.intake_kcal == null && diet_info.burned_kcal != null) {
        payload = {
            "intake_kcal": (food.kcal * gram).toFixed(2),
            "burned_kcal": parseFloat(diet_info.burned_kcal),
            "exercise_time": 0,
            "weight": 0,
            "intake_carbs": (food.carbs * gram).toFixed(2),
            "intake_protein": (food.protein * gram).toFixed(2),
            "intake_fat": (food.fat * gram).toFixed(2)
        }
    } else {
        payload = {
            "intake_kcal": (food.kcal * gram).toFixed(2),
            "burned_kcal": 0,
            "exercise_time": 0,
            "weight": 0,
            "intake_carbs": (food.carbs * gram).toFixed(2),
            "intake_protein": (food.protein * gram).toFixed(2),
            "intake_fat": (food.fat * gram).toFixed(2)
        }
    }
    return payload
}

function exerciseCalculator(payload, diet_info) {
    var diet_payload = {};
    if (diet_info.intake_kcal == null && diet_info.burned_kcal == null) {
        diet_payload = {
            "intake_kcal": 0.0,
            "burned_kcal": payload.burned_kcal,
            "exercise_time": 0.0,
            "weight": 0.0,
            "intake_carbs": 0.0,
            "intake_protein": 0.0,
            "intake_fat": 0.0
        }
    } else {
        diet_payload = {
            "intake_kcal": diet_info.intake_kcal,
            "burned_kcal": (parseFloat((diet_info.burned_kcal)) + ((payload.burned_kcal))).toFixed(2),
            "exercise_time": 0,
            "weight": 0,
            "intake_carbs": diet_info.intake_carbs,
            "intake_protein": diet_info.intake_protein,
            "intake_fat": diet_info.intake_fat,
        }
    }
    return diet_payload
}

function kcalCalculator(payload) {
    var _payload = payload;
    if (payload.exercise == "푸쉬업") {
        _payload['burned_kcal'] = parseFloat((payload.reps * 0.47).toFixed(2));
    }
    else if (payload.exercise == "스쿼트") {
        _payload['burned_kcal'] = parseFloat((payload.reps * 0.5).toFixed(2));
    }
    else if (payload.exercise == "풀업") {
        _payload['burned_kcal'] = parseFloat((payload.reps * 1.0).toFixed(2));
    }
    else if (payload.exercise == "윗몸일으키기") {
        _payload['burned_kcal'] = parseFloat((payload.reps * 0.9).toFixed(2));
    }
    else if (payload.exercise == "데드리프트") {
        _payload['burned_kcal'] = parseFloat((payload.reps * 1.5).toFixed(2));
    }
    else if (payload.exercise == "바벨로우") {
        _payload['burned_kcal'] = parseFloat((payload.reps * 1.3).toFixed(2));
    }
    else if (payload.exercise == "바벨컬") {
        _payload['burned_kcal'] = parseFloat((payload.reps * 1.3).toFixed(2));
    }
    else if (payload.exercise == "덤벨컬") {
        _payload['burned_kcal'] = parseFloat((payload.reps * 1.3).toFixed(2));
    }
    else if (payload.exercise == "플랭크") {
        _payload['burned_kcal'] = parseFloat((payload.reps * 1.3).toFixed(2));
    }

    return _payload
}
function aerobicCalculator(payload) {
    var _payload = payload;
    if (payload.exercise == "런닝머신") {
        _payload['burned_kcal'] = parseFloat((payload.time * 0.16).toFixed(2));
    }
    else if (payload.exercise == "계단오르기") {
        _payload['burned_kcal'] = parseFloat((payload.time * 0.142).toFixed(2));
    }
    else if (payload.exercise == "조깅") {
        _payload['burned_kcal'] = parseFloat((payload.time * 0.13).toFixed(2));
    }

    return _payload
}
/*
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
            "intake_kcal": ((food.kcal + Number(diet_info.intake_kcal)) * ratio).toFixed(2),
            "burned_kcal": ((diet_info.burned_kcal) * ratio).toFixed(2),
            "exercise_time": ((diet_info.exercise_time) * ratio).toFixed(2),
            "weight": ((diet_info.weight) * ratio).toFixed(2),
            "intake_carbs": ((food.carbs + Number(diet_info.intake_carbs)) * ratio).toFixed(2),
            "intake_protein": ((food.protein + Number(diet_info.intake_protein)) * ratio).toFixed(2),
            "intake_fat": ((food.fat + Number(diet_info.intake_fat)) * ratio).toFixed(2)
        }
    } else {
        payload = {
            "intake_kcal": (food.kcal * ratio).toFixed(2),
            "burned_kcal": 0,
            "exercise_time": 0,
            "weight": 0,
            "intake_carbs": (food.carbs * ratio).toFixed(2),
            "intake_protein": (food.protein * ratio).toFixed(2),
            "intake_fat": (food.fat * ratio).toFixed(2)
        }
    }
    return payload
}
*/
function addFoodinfo(food, payload) {
    gram = payload.gram;

    payload.kcal = (food.kcal * gram).toFixed(2)
    payload.carbs = (food.carbs * gram).toFixed(2)
    payload.protein = (food.protein * gram).toFixed(2)
    payload.fat = (food.fat * gram).toFixed(2)

    return payload
}
/*
function addFoodinfo(food, payload) {
    ratio = 1;

    switch (payload.size) {
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
    payload.kcal = (food.kcal * ratio).toFixed(2)
    payload.carbs = (food.carbs * ratio).toFixed(2)
    payload.protein = (food.protein * ratio).toFixed(2)
    payload.fat = (food.fat * ratio).toFixed(2)

    return payload
}
*/

module.exports = router;