const router = require('express').Router();
const food = require('../models/food');

// Find All
router.get('/', (req, res) => {
    food.findAll()
        .then((foods) => {
            if (!foods.length) return res.status(404).send({ err: 'food not found' });
            res.send({ foods });
        })
        .catch(err => res.status(500).send(err));
});

// Find One by foodid
router.get('/:foodName', (req, res) => {
    food.findOneByfoodName(req.params.foodName)
        .then((food) => {
            if (!food) return res.status(404).send({ err: 'food not found' });
            res.send({ food });
        })
        .catch(err => res.status(500).send(err));
});

// Create new food document
router.post('/', (req, res) => {
    food.create(req.body)
        .then(food => res.send(food))
        .catch(err => res.status(500).send(err));
});

// Update by foodid
router.put('/foodid/:foodid', (req, res) => {
    food.updateByfoodid(req.params.foodid, req.body)
        .then(food => res.send(food))
        .catch(err => res.status(500).send(err));
});

// Delete by foodid
router.delete('/foodid/:foodid', (req, res) => {
    food.deleteByfoodid(req.params.foodid)
        .then(() => res.sendStatus(200))
        .catch(err => res.status(500).send(err));
});

module.exports = router;