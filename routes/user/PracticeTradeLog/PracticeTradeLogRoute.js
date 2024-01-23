const express = require('express')
const route = express.Router();

const {PracticeTradeLogStore, PracticeTradeLogHistory} = require('./../../../controller/user/PracticeTradeLog/PracticeTradeLogController');

route.post('/store',  PracticeTradeLogStore);
route.get('/history/:id',  PracticeTradeLogHistory);


module.exports = route;