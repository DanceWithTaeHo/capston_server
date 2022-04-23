const router = require('express').Router();
const user = require('../models/user');
const userLog = require('../models/user_log');

// Find All
router.get('/', (req, res) => {
    user.findAll()
        .then((users) => {
            if (!users.length) return res.status(404).send({ err: 'user not found' });
            res.send({ users });
        })
        .catch(err => res.status(500).send(err));
});

// Find One by userid
router.get('/:userId', (req, res) => {
    user.findOneByUserId(req.params.userId)
        .then((user) => {
            if (!user) return res.status(404).send({ err: 'user not found' });
            res.send({ user });
        })
        .catch(err => res.status(500).send(err));
});

// Create new user document
router.post('/', (req, res) => {
    user.create(req.body)
        .then((user) => {
            userLogPayload = {
                uid: req.body.uid,
                dates: []
            };
            userLog.create(req.body).catch(err => res.status(500).send(err));
            res.send(user);
        })
        .catch(err => res.status(500).send(err));
});

// Update by userid
router.put('/:userId', (req, res) => {
    user.updateByUserId(req.params.userId, req.body)
        .then(user => res.send(user))
        .catch(err => res.status(500).send(err));
});

// Delete by userid
router.delete('/:userId', (req, res) => {
    user.deleteByUserId(req.params.userId)
        .then(() => res.sendStatus(200))
        .catch(err => res.status(500).send(err));
});

module.exports = router;