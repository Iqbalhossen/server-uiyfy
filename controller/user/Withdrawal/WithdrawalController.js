const CryptoCurrencyModels = require('../../../models/CryptoCurrency/CryptoCurrencyModels');
const ThradeSettingModels = require('../../../models/ThradeSetting/ThradeSettingModel');
const TradeLogModels = require('../../../models/TradeLog/TradeLogModels');
const DepositModels = require('../../../models/Deposit/DepositModels');
const WithdrawalModels = require('../../../models/Withdrawal/WithdrawalModels');
const WithdrawalMethodsModels = require('../../../models/WithdrawalMethods/WithdrawalMethodsModels');

const { ObjectId } = require('mongodb');

const WithdrawalView = async (req, res) => {
    try {
        const id = req.params.id;
        const data = await WithdrawalModels.find({user_id:id});
        const WithdrawalAcceptSum = await WithdrawalModels.aggregate([
            { $match: { Status: 1, user_id: id } },
            { $group: { _id: {}, sum: { $sum: "$AmountWithVat" } } }
        ]);
        const WithdrawalRejectSum = await WithdrawalModels.aggregate([
            { $match: { Status: 2, user_id: id } },
            { $group: { _id: {}, sum: { $sum: "$AmountWithVat" } } }
        ]);
        const WithdrawalPendingSum = await WithdrawalModels.aggregate([
            { $match: { Status: 1, user_id: id } },
            { $group: { _id: {}, sum: { $sum: "$AmountWithVat" } } }
        ]);
        res.status(201).json({
            success: true,
            data: data,
            WithdrawalAcceptSum: WithdrawalAcceptSum,
            WithdrawalRejectSum: WithdrawalRejectSum,
            WithdrawalPendingSum: WithdrawalPendingSum,
            length: data.length
        });


    } catch (error) {
        console.log(error);
    }
};
const WithdrawalMethodView = async (req, res) => {
    try {

        const data = await WithdrawalMethodsModels.find({ Status: 1 });
        res.status(201).json({
            success: true,
            data: data,
            length: data.length
        });


    } catch (error) {
        console.log(error);
    }
};

const WithdrawalAmountCheck = async (req, res) => {
    try {
        const data = req.body;
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

        const WithdrawalPendingBalanceArraySum = await WithdrawalModels.aggregate([
            { $match: { user_id: data.user_id, Status: 0 } },
            { $group: { _id: {}, sum: { $sum: "$AmountWithVat" } } }
        ]);
        const WithdrawalSuccessBalanceArraySum = await WithdrawalModels.aggregate([
            { $match: { user_id: data.user_id, Status: 1 } },
            { $group: { _id: {}, sum: { $sum: "$AmountWithVat" } } }
        ]);

        const TradeLogLossBalanceSum = parseFloat(`${TradeLogLossBalanceArraySum[0] ? TradeLogLossBalanceArraySum[0].sum : 0}`);

        const TradeLogBalanceSum = parseFloat(`${TradeLogBalanceArraySum[0] ? TradeLogBalanceArraySum[0].sum : 0}`);

        const WithdrawalPendingBalanceSum = parseFloat(`${WithdrawalPendingBalanceArraySum[0] ? WithdrawalPendingBalanceArraySum[0].sum : 0}`);

        const WithdrawalSuccessBalanceSum = parseFloat(`${WithdrawalSuccessBalanceArraySum[0] ? WithdrawalSuccessBalanceArraySum[0].sum : 0}`);

        /// Available Balance
        const AvailableBalanceSum = DepositBalanceSum + TradeLogWinBalanceSum + TradeLogDrawBalanceSum;

        /// Minus Balance
        const MinusBalenceSum = TradeLogBalanceSum + TradeLogLossBalanceSum + WithdrawalPendingBalanceSum + WithdrawalSuccessBalanceSum + parseFloat(data?.Amount);

        /// Reming Available Balance
        const RemingBalanceSum = AvailableBalanceSum - MinusBalenceSum;

        const query = { _id: new ObjectId(data.MethodId) };
        const results = await WithdrawalMethodsModels.findOne(query);
        if (parseFloat(results.MinimumAmount) > parseFloat(data.Amount)) {
            res.status(400).json({
                success: false,
                message: `Minimum Amount ${results.MinimumAmount} USD`,
            });
        } else if (parseFloat(results.MaximumAmount) < parseFloat(data.Amount)) {
            res.status(400).json({
                success: false,
                message: `Maximum Amount ${results.MaximumAmount} USD`,
            });
        } else if (RemingBalanceSum >= 0) {
            res.status(201).json({
                success: true,
                data: results,
                user_id: data?.user_id,
                amount: data?.Amount,
            });
        } else {
            res.status(400).json({
                success: false,
                message: `Amount low`,
            });
        }



    } catch (error) {
        console.log(error);
    }
};

const WithdrawalStore = async (req, res) => {
    try {
        const data = req.body;
        // console.log(data.WithdrawalAddress)
        /// Available Balance data

        function RandomTransaction(length) {
            let result = '';
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            const charactersLength = characters.length;
            let counter = 0;
            while (counter < length) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
                counter += 1;
            }
            return result;
        }

        const FixedCharge = parseFloat(data.GatewayData.data.data.FixedCharge);
        const PercentCharge = parseFloat(data.GatewayData.data.data.PercentCharge);
        const userAmount = parseFloat(data.GatewayData.data.amount);

        if (FixedCharge > 0 && PercentCharge <= 0) {

            const ChargeAmount = (userAmount - parseFloat(FixedCharge))

            const storeData = {
                user_id: data.GatewayData.data.user_id,
                GatewayName: data.GatewayData.data.data.Name,
                Transaction: RandomTransaction(15),
                Amount:  ChargeAmount,
                AmountWithVat: userAmount,
                MinimumAmount: data.GatewayData.data.data.MinimumAmount,
                MaximumAmount: data.GatewayData.data.data.MaximumAmount,
                Conversion: data.GatewayData.data.data.Rate,
                WithdrawalAddress: data.WithdrawalAddress,
                NetworkType: data.NetworkType,
                Status: 0,
            } 
            
            await WithdrawalModels.create(storeData);
            res.status(201).json({
                success: true,
                message: `Withdraw pending`,
                data: storeData,
            });

        } else if (FixedCharge <= 0 && PercentCharge > 0) {
            const ChargeAmount = (userAmount - parseFloat((PercentCharge * userAmount) / 100));

            const storeData = {
                user_id: data.GatewayData.data.user_id,
                GatewayName: data.GatewayData.data.data.Name,
                Transaction: RandomTransaction(15),
                Amount: ChargeAmount,
                AmountWithVat: userAmount,
                MinimumAmount: data.GatewayData.data.data.MinimumAmount,
                MaximumAmount: data.GatewayData.data.data.MaximumAmount,
                Conversion: data.GatewayData.data.data.Rate,
                WithdrawalAddress: data.WithdrawalAddress,
                NetworkType: data.NetworkType,
                Status: 0,
            }
            await WithdrawalModels.create(storeData);
            res.status(201).json({
                success: true,
                message: `WithDraw pending`,
                data: storeData,
            });

        } else {

            const storeData = {
                user_id: data.GatewayData.data.user_id,
                GatewayName: data.GatewayData.data.data.Name,
                Transaction: RandomTransaction(15),
                Amount: userAmount,
                AmountWithVat: userAmount,
                MinimumAmount: data.GatewayData.data.data.MinimumAmount,
                MaximumAmount: data.GatewayData.data.data.MaximumAmount,
                Conversion: data.GatewayData.data.data.Rate,
                WithdrawalAddress: data.WithdrawalAddress,
                NetworkType: data.NetworkType,
                Status: 0,
            }

            await WithdrawalModels.create(storeData);
            res.status(201).json({
                success: true,
                message: `WithDraw pending`,
                data: storeData,
            });
        }





    } catch (error) {
        console.log(error);
    }
};






module.exports = { WithdrawalMethodView, WithdrawalStore, WithdrawalAmountCheck, WithdrawalView};
