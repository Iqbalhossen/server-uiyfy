const CryptoCurrencyModels = require('../../../models/CryptoCurrency/CryptoCurrencyModels');
const ThradeSettingModels = require('../../../models/ThradeSetting/ThradeSettingModel');
const PracticeTradeLogModels = require('../../../models/PracticeTradeLog/PracticeTradeLogModels');
const TradeLogModels = require('../../../models/TradeLog/TradeLogModels');
const DepositModels = require('../../../models/Deposit/DepositModels');

const { ObjectId } = require('mongodb');
// Home Bouns Store section 
const PracticeTradeLogStore = async (req, res) => {
    try {
        const data = req.body;
        const thradeSettingData = await ThradeSettingModels.findOne({ _id: new ObjectId(data.thradeSetting_id) });

        /// Available Balance data
        const DepositBalanceArraySum = await DepositModels.aggregate([
            { $match: { Status: 1, user_id: data.user_id } },
            { $group: { _id: {}, sum: { $sum: "$Amount" } } }
        ]);

        const TradeLogWinBalanceArraySum = await TradeLogModels.aggregate([
            { $match: { user_id: data.user_id, Result: 'win' } },
            { $group: { _id: {}, sum: { $sum: "$Result_Amount" } } }
        ]);

        const TradeLogDrawBalanceArraySum = await TradeLogModels.aggregate([
            { $match: { user_id: data.user_id, Result: 'draw' } },
            { $group: { _id: {}, sum: { $sum: "$Result_Amount" } } }
        ]);


        const DepositBalanceSum = parseFloat(`${DepositBalanceArraySum[0] ? DepositBalanceArraySum[0].sum : 0}`);

        const TradeLogWinBalanceSum = parseFloat(`${TradeLogWinBalanceArraySum[0] ? TradeLogWinBalanceArraySum[0].sum : 0}`);

        const TradeLogDrawBalanceSum = parseFloat(`${TradeLogDrawBalanceArraySum[0] ? TradeLogDrawBalanceArraySum[0].sum : 0}`);


        /// Minus Balance data 
        const TradeLogBalanceArraySum = await TradeLogModels.aggregate([
            { $match: { user_id: data.user_id, Result: 'Loss' } },
            { $group: { _id: {}, sum: { $sum: "$Amount" } } }
        ]);

        const TradeLogBalanceSum = parseFloat(`${TradeLogBalanceArraySum[0] ? TradeLogBalanceArraySum[0].sum : 0}`);

        /// Available Balance
        const AvailableBalanceSum = DepositBalanceSum + TradeLogWinBalanceSum + TradeLogDrawBalanceSum;

        /// Minus Balance
        const MinusBalenceSum = TradeLogBalanceSum + parseFloat(data?.amount);

        /// Reming Available Balance
        const RemingBalanceSum = AvailableBalanceSum - MinusBalenceSum;


        if (RemingBalanceSum >= 0) {

            const timeObject = new Date();
        
            const storeData = {
                user_id: data.user_id,
                Crypto: data?.CryptoCurrency?.Symbol,
                Crypto_price: data?.Crypto_price,
                Amount: data?.amount,
                Result_Amount: 0,
                InTime: new Date(),
                HighLow: data?.HighLow,
                Result: null,
                Status: 0,
                //// not working
                OutTime: new Date(timeObject.getTime() + 1000 * thradeSettingData?.Time).toLocaleString().
                    replace(/T/, ' ').
                    replace(/\..+/, ''),
                Symbol: data?.CryptoCurrency?.Symbol,
                Time: thradeSettingData?.Time,
                Unit: thradeSettingData?.Unit,
                profit: thradeSettingData?.Profit,

            }


               const results = await PracticeTradeLogModels.create(storeData);
                res.status(201).json({
                    success: true,
                    message: `Practice Thrade ${data?.HighLow}`,
                    data: results,
                });

        } else { ////   Balance low
            res.status(400).json({
                success: false,
                message: `Balance low`,
            });
        }


    } catch (error) {
        console.log(error);
    }
};


const PracticeTradeLogHistory = async (req, res) => {
    try {
        const { id } = req.params;
        /// Available Balance data

        const TradeLogWinBalanceArraySum = await PracticeTradeLogModels.aggregate([
            { $match: { user_id: id, Result: 'Win' } },
            { $group: { _id: {}, sum: { $sum: "$Result_Amount" } } }
        ]);

        const TradeLogDrawBalanceArraySum = await PracticeTradeLogModels.aggregate([
            { $match: { user_id: id, Result: 'Draw' } },
            { $group: { _id: {}, sum: { $sum: "$Result_Amount" } } }
        ]);
        const TradeLogLossBalanceArraySum = await PracticeTradeLogModels.aggregate([
            { $match: { user_id: id, Result: 'Loss' } },
            { $group: { _id: {}, sum: { $sum: "$Amount" } } }
        ]);

        const TradeLogArraySum = await PracticeTradeLogModels.aggregate([
            { $match: { user_id: id } },
            { $group: { _id: {}, sum: { $sum: "$Result_Amount" } } }
        ]);


        const TradeLogWinBalanceSum = parseFloat(`${TradeLogWinBalanceArraySum[0] ? TradeLogWinBalanceArraySum[0].sum : 0}`);

        const TradeLogDrawBalanceSum = parseFloat(`${TradeLogDrawBalanceArraySum[0] ? TradeLogDrawBalanceArraySum[0].sum : 0}`);

        const TradeLogLossBalanceSum = parseFloat(`${TradeLogLossBalanceArraySum[0] ? TradeLogLossBalanceArraySum[0].sum : 0}`);

        const TradeLogSum = parseFloat(`${TradeLogArraySum[0] ? TradeLogArraySum[0].sum : 0}`);

        const TradeLog = await PracticeTradeLogModels.find({ user_id: id })

        res.status(201).json({
            success: true,
            data: TradeLog,
            TradeLogSum: TradeLogSum,
            TradeLogWin: TradeLogWinBalanceSum,
            TradeLogDraw: TradeLogDrawBalanceSum,
            TradeLogLoss: TradeLogLossBalanceSum,
            length: TradeLog.length
        });

    } catch (error) {
        console.log(error);
    }
};



module.exports = { PracticeTradeLogStore, PracticeTradeLogHistory };
