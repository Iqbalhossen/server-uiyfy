const express = require('express')
const route = express.Router();

const {TradeLogStore, TradeLogHistory,} = require('./../../../controller/user/TradeLogController');

route.post('/store',  TradeLogStore);
route.get('/history/:id',  TradeLogHistory);


module.exports = route;