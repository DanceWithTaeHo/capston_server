// ENV
require('dotenv').config();
// DEPENDENCIES
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 4500;

// Static File Service
app.use(express.static('public'));
// Body-parser
app.use(bodyParser.urlencoded({
    limit: '300mb', extended: true
}));
app.use(bodyParser.json({
    limit: '300mb'
}));
// Node의 native Promise 사용
mongoose.Promise = global.Promise;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Successfully connected to mongodb'))
    .catch(e => console.error(e));

// ROUTERS
app.use('/foods', require('./routes/foods'));
app.use('/users', require('./routes/users'));
app.use('/userLogs', require('./routes/user_logs'));

app.listen(port, () => console.log(`Server listening on port ${port}`));