const TransactionsModels = require('../../models/Transactions/TransactionsModels');
const userModels = require('../../models/userModels');
const { ObjectId } = require('mongodb');

const TransactionsDeposit = async (data) => {

    try {
        const { user_id, GatewayName, Transaction, Amount, AmountWithVat } = data;

        const query = { _id: new ObjectId(user_id) };
        const userFind = await userModels.findOne(query);

        const option = { upsert: true };
        const userBalance = parseFloat(parseFloat(userFind.balance) + parseFloat(Amount)).toFixed(2);
        await userModels.findByIdAndUpdate(query, { balance: userBalance }, option);

        const ExitsData  = await TransactionsModels.findOne().sort('-created_at');
        if(ExitsData === null){    
     
        const StoreData = {user_id:user_id, amount:AmountWithVat, charge: (parseFloat(AmountWithVat)- parseFloat(Amount)) , post_balance:Amount, trx_type:'+', trx:Transaction, details:`Deposit Via ${GatewayName}`, }
         await TransactionsModels.create(StoreData);

        }else{ 

        const StoreData = {user_id:user_id, amount:AmountWithVat, charge: (parseFloat(AmountWithVat)- parseFloat(Amount)) , post_balance:(parseFloat(Amount) + parseFloat(ExitsData.post_balance)), trx_type:'+', trx:Transaction, details:`Deposit Via ${GatewayName}`, }
         await TransactionsModels.create(StoreData);

        }

    } catch (error) {
        console.log(error);
    }
}


const TransactionsWithdrawal = async (data) => {

    try {
        const { user_id, GatewayName, Transaction, Amount, AmountWithVat } = data;
        const query = { _id: new ObjectId(user_id) };
        const userFind = await userModels.findOne(query);

        const option = { upsert: true };

        const userBalance = parseFloat(parseFloat(userFind.balance) - parseFloat(AmountWithVat)).toFixed(2);
        await userModels.findByIdAndUpdate(query, { balance: userBalance }, option);

        const ExitsData  = await TransactionsModels.findOne().sort('-created_at');
        if(ExitsData === null){    
     
        const StoreData = {user_id:userFind.name, user_id:user_id, amount:AmountWithVat, charge: (parseFloat(AmountWithVat)- parseFloat(Amount)) , post_balance:-AmountWithVat, trx_type:'-', trx:Transaction, details:`Withdraw Via ${GatewayName}`, }
         await TransactionsModels.create(StoreData);

        }else{ 

        const StoreData = {user_id:userFind.name, user_id:user_id, amount:AmountWithVat, charge: (parseFloat(AmountWithVat)- parseFloat(Amount)) , post_balance:( parseFloat(ExitsData.post_balance) - parseFloat(AmountWithVat) ), trx_type:'-', trx:Transaction, details:`Withdraw Via ${GatewayName}`, }
         await TransactionsModels.create(StoreData);

        }

    } catch (error) {
        console.log(error);
    }
}



module.exports = { TransactionsDeposit, TransactionsWithdrawal};