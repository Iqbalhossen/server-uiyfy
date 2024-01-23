const CryptoCurrencyModels = require('../../models/CryptoCurrency/CryptoCurrencyModels');
const ThradeSettingModels = require('../../models/ThradeSetting/ThradeSettingModel');
const TradeLogModels = require('../../models/TradeLog/TradeLogModels');
const DepositModels = require('../../models/Deposit/DepositModels');

const { ObjectId } = require('mongodb');
// Home Bouns Store section 
const TradeLogStore = async (req, res) => {
    try {
        const data = req.body;
        const thradeSettingData = await ThradeSettingModels.findOne({ _id: new ObjectId(data.thradeSetting_id) });

        /// Available Balance data
        const DepositBalanceArraySum = await DepositModels.aggregate([
            { $match: { Status: 1, user_id: data.user_id } },
            { $group: { _id: {}, sum: { $sum: "$Amount" } } }
        ]);

        const TradeLogWinBalanceArraySum = await TradeLogModels.aggregate([
            { $match: { user_id: data.user_id, Result: 'Win' } },
            { $group: { _id: {}, sum: { $sum: "$Result_Amount" } } }
        ]);

        const TradeLogDrawBalanceArraySum = await TradeLogModels.aggregate([
            { $match: { user_id: data.user_id, Result: 'Draw' } },
            { $group: { _id: {}, sum: { $sum: "$Result_Amount" } } }
        ]);


        const DepositBalanceSum = parseFloat(`${DepositBalanceArraySum[0] ? DepositBalanceArraySum[0].sum : 0}`);
        const TradeLogWinBalanceSum = parseFloat(`${TradeLogWinBalanceArraySum[0] ? TradeLogWinBalanceArraySum[0].sum : 0}`);
        const TradeLogDrawBalanceSum = parseFloat(`${TradeLogDrawBalanceArraySum[0] ? TradeLogDrawBalanceArraySum[0].sum : 0}`);


        /// Minus Balance data 
        const TradeLogLossBalanceArraySum = await TradeLogModels.aggregate([
            { $match: { user_id: data.user_id, Result: 'Loss' } },
            { $group: { _id: {}, sum: { $sum: "$Amount" } } }
        ]);
        
        const TradeLogBalanceArraySum = await TradeLogModels.aggregate([
            { $match: { user_id: data.user_id, Result: null } },
            { $group: { _id: {}, sum: { $sum: "$Amount" } } }
        ]);

        const TradeLogLossBalanceSum = parseFloat(`${TradeLogLossBalanceArraySum[0] ? TradeLogLossBalanceArraySum[0].sum : 0}`);
        const TradeLogBalanceSum = parseFloat(`${TradeLogBalanceArraySum[0] ? TradeLogBalanceArraySum[0].sum : 0}`);

        /// Available Balance
        const AvailableBalanceSum = DepositBalanceSum + TradeLogWinBalanceSum + TradeLogDrawBalanceSum;

        /// Minus Balance
        const MinusBalenceSum = TradeLogBalanceSum + TradeLogLossBalanceSum + parseFloat(data?.amount);

        /// Reming Available Balance
        const RemingBalanceSum = AvailableBalanceSum - MinusBalenceSum;


        if (RemingBalanceSum >= 0) {

            const timeObject = new Date();
            // timeObject = new Date(timeObject.getTime() + 1000 * 10);
            // console.log(timeObject);
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
                OutTime: new Date(timeObject.getTime() + 1000 * thradeSettingData?.Time).toISOString().
                    replace(/T/, ' ').
                    replace(/\..+/, ''),
                Symbol: data?.CryptoCurrency?.Symbol,
                Time: thradeSettingData?.Time,
                Unit: thradeSettingData?.Unit,
                profit: thradeSettingData?.Profit,

            }


            await TradeLogModels.create(storeData);
            res.status(201).json({
                success: true,
                message: `Thrade ${data?.HighLow}`,
                data: storeData,
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


const TradeLogHistory = async (req, res) => {
    try {
        const { id } = req.params;
        /// Available Balance data
  
        const TradeLogWinBalanceArraySum = await TradeLogModels.aggregate([
            { $match: { user_id: id, Result: 'Win' } },
            { $group: { _id: {}, sum: { $sum: "$Result_Amount" } } }
        ]);

        const TradeLogDrawBalanceArraySum = await TradeLogModels.aggregate([
            { $match: { user_id: id, Result: 'Draw' } },
            { $group: { _id: {}, sum: { $sum: "$Result_Amount" } } }
        ]);
        const TradeLogLossBalanceArraySum = await TradeLogModels.aggregate([
            { $match: { user_id: id, Result: 'Loss' } },
            { $group: { _id: {}, sum: { $sum: "$Amount" } } }
        ]);

        const TradeLogArraySum = await TradeLogModels.aggregate([
            { $match: { user_id: id } },
            { $group: { _id: {}, sum: { $sum: "$Result_Amount" } } }
        ]);


        const TradeLogWinBalanceSum = parseFloat(`${TradeLogWinBalanceArraySum[0] ? TradeLogWinBalanceArraySum[0].sum : 0}`);

        const TradeLogDrawBalanceSum = parseFloat(`${TradeLogDrawBalanceArraySum[0] ? TradeLogDrawBalanceArraySum[0].sum : 0}`);

        const TradeLogLossBalanceSum = parseFloat(`${TradeLogLossBalanceArraySum[0] ? TradeLogLossBalanceArraySum[0].sum : 0}`);

        const TradeLogSum = parseFloat(`${TradeLogArraySum[0] ? TradeLogArraySum[0].sum : 0}`);

        const TradeLog = await TradeLogModels.find({user_id: id})

        res.status(201).json({
            success: true,
            data: TradeLog,
            TradeLogSum:TradeLogSum,
            TradeLogWin: TradeLogWinBalanceSum,
            TradeLogDraw: TradeLogDrawBalanceSum,
            TradeLogLoss: TradeLogLossBalanceSum,
            length: TradeLog.length
        });

    } catch (error) {
        console.log(error);
    }
};





module.exports = { TradeLogStore, TradeLogHistory};
