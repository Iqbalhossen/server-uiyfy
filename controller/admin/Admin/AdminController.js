const AdminModels = require('../../../models/Admin/AdminModels');
const userModels = require('../../../models/userModels');
const TradeLogModels = require('../../../models/TradeLog/TradeLogModels');
const DepositModels = require('../../../models/Deposit/DepositModels');
const WithdrawalModels = require('../../../models/Withdrawal/WithdrawalModels');

const { ObjectId } = require('mongodb');
// Home Bouns Store section 
const AdminRoleView = async (req, res) => {
    try {

        const data = await AdminModels.find();
        res.status(201).json({
            success: true,
            data: data,
            length: data.length
        });


    } catch (error) {
        console.log(error);
    }
};

const AdminRoleStore = async (req, res) => {
    try {
        const data = req.body;
        const results = await AdminModels.create(data);
        res.status(201).json({
            success: true,
            message: "Role Create successfull",
            data: results,
        });


    } catch (error) {
        console.log(error);
    }
};

const AdminRoleViewById = async (req, res) => {
    try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const data = await AdminModels.findOne(query);
        res.status(201).json({
            success: true,
            data: data,
        });


    } catch (error) {
        console.log(error);
    }
};
const AdminRoleUpdate = async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;
        const filter = { _id: new ObjectId(id) };
        const option = { upsert: true };
        const results = await AdminModels.findByIdAndUpdate(filter, data, option);
        res.status(201).json({
            success: true,
            message: "Update successfull",
            data: results,
        });


    } catch (error) {
        console.log(error);
    }
};

const AdminRoleDelete = async (req, res) => {
    try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const results = await AdminModels.findByIdAndDelete(query);
        res.status(201).json({
            success: true,
            message: "Delete successfull",
            data: results,
        });


    } catch (error) {
        console.log(error);
    }
};

const AdminDashboardView = async (req, res) => {
    try {

        const TotalUser = await userModels.find();
        const ActiveUser = await userModels.find();
        const EmailUnverifyUser = await userModels.find({ is_verified: false });
        const MobileUnverifyUser = await userModels.find();


        const TotalTrade = await TradeLogModels.find();
        const WinTrade = await TradeLogModels.find({ Result: 'Win' });
        const LossTrade = await TradeLogModels.find({ Result: 'Loss' });
        const DrawTrade = await TradeLogModels.find({ Result: 'Draw' });

        const DepositBalanceArraySum = await DepositModels.aggregate([
            { $match: { Status: 1 } },
            { $group: { _id: {}, sum: { $sum: "$AmountWithVat" } } }

        ]);

        const DepositBalanceSum = parseFloat(`${DepositBalanceArraySum[0] ? DepositBalanceArraySum[0].sum : 0}`);

        const PendingDeposit = await DepositModels.find({ Status: 0 });
        const RejectDeposit = await DepositModels.find({ Status: 2 });

        const WithdrawalAcceptArraySum = await WithdrawalModels.aggregate([
            { $match: { Status: 1 } },
            { $group: { _id: {}, sum: { $sum: "$AmountWithVat" } } }
        ]);

        const WithdrawalAcceptSum = parseFloat(`${WithdrawalAcceptArraySum[0] ? WithdrawalAcceptArraySum[0].sum : 0}`);

        const PendingWithdrawal = await WithdrawalModels.find({ Status: 0 });
        const RejectWithdrawal = await WithdrawalModels.find({ Status: 2 });

        res.status(201).json({
            success: true,
            TotalUser: TotalUser.length,
            ActiveUser: ActiveUser.length,
            EmailUnverifyUser: EmailUnverifyUser.length,
            MobileUnverifyUser: MobileUnverifyUser.length,
            TotalTrade: TotalTrade.length,
            WinTrade: WinTrade.length,
            LossTrade: LossTrade.length,
            DrawTrade: DrawTrade.length,
            DepositBalanceSum,
            PendingDeposit: PendingDeposit.length,
            RejectDeposit: RejectDeposit.length,
            WithdrawalAcceptSum,
            PendingWithdrawal: PendingWithdrawal.length,
            TotalTrade: RejectWithdrawal.length,
        });


    } catch (error) {
        console.log(error);
    }
};





module.exports = { AdminRoleView, AdminRoleStore, AdminRoleViewById, AdminRoleUpdate, AdminRoleDelete, AdminDashboardView };
