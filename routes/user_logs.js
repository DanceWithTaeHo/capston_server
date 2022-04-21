const router = require('express').Router();
const userLog = require('../models/user_log');

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
    userLog.findOneByUserId(req.params.userId)
        .then((userLog) => {
            if (!userLog) return res.status(404).send({ err: 'userLog not found' });
            date = req.params.date;
            dateLog = userLog.date[date]
            res.send({ dateLog });
        })
        .catch(err => res.status(500).send(err));
});

// 해당 날짜의 운동 정보
router.get('/:userId/:date/exercise_info', (req, res) => {
    userLog.findOneByUserId(req.params.userId)
        .then((userLog) => {
            if (!userLog) return res.status(404).send({ err: 'userLog not found' });
            date = req.params.date;
            exercise_info = userLog.date[date].exercise_info
            res.send({ exercise_info });
        })
        .catch(err => res.status(500).send(err));
});

// Create new user document
router.post('/', (req, res) => {
    userLog.create(req.body)
        .then(userLog => res.send(userLog))
        .catch(err => res.status(500).send(err));
});

// Update by userid
router.put('/:userId', (req, res) => {
    userLog.updateByUserId(req.params.userId, req.body)
        .then(userLog => res.send(userLog))
        .catch(err => res.status(500).send(err));
});

// Delete by userid
router.delete('/userid/:userId', (req, res) => {
    userLog.deleteByUserId(req.params.userId)
        .then(() => res.sendStatus(200))
        .catch(err => res.status(500).send(err));
});

module.exports = router;