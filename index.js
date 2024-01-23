const { urlencoded } = require('body-parser');
const bodyParser = require('body-parser');
const express = require('express');
const database = require('./config/database');
const app = express();
const dotenv = require('dotenv').config();
const cors = require('cors');
const PORT = process.env.PORT || 4000;
const cookieParser = require('cookie-parser')
database();
app.use(cors());
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));
app.use(express.json())


app.use("/public/data/uploads/",express.static("./public/data/uploads/"));

app.get('/', (req, res) => {
    res.send('Hello World!')
})

require('./commonfile/TradeLogCron/TradeLogCron');
require('./commonfile/PracticeTradeLogCron/PracticeTradeLogCron');

// admin route middleware 
const adminHomeRoute = require('./routes/admin/Frontend/FrontendRoutes');
const adminUserRoute = require('./routes/admin/User/userRoutes');
const adminMenuPageRoute = require('./routes/admin/Frontend/MenuPageRoutes');
const adminSiteSettingRoute = require('./routes/admin/Setting/SiteSettingRoutes');
const adminManualGatewaysRoute = require('./routes/admin/PaymentGateways/ManualGatewaysRoute');
const adminCryptoCurrencyRoute = require('./routes/admin/CryptoCurrency/CryptoCurrencyRoutes');
const adminThradeSettingRoute = require('./routes/admin/ThradeSetting/ThradeSettingRoute');
const adminDepositRoute = require('./routes/admin/Deposits/DepositsRoute');
const adminTradeLogRoute = require('./routes/admin/TradeLog/TradeLogRoute');
const adminPracticeTradeLogRoute = require('./routes/admin/PracticeTradeLog/PracticeTradeLogRoute');
const adminWithdrawalRoute = require('./routes/admin/Withdrawal/WithdrawalRoute');
const adminKYCRoute = require('./routes/admin/KYC/KYCRoute');
const adminRoleRoute = require('./routes/admin/Admin/AdminRoutes');
const adminUserTradeLogRoute = require('./routes/admin/User/userTradeLogRoutes');
const adminUserTransactionsRoute = require('./routes/admin/Transactions/TransactionsRoutes');
const adminSubscriberManagerRoutes = require('./routes/admin/SubscriberManager/SubscriberManagerRoutes');


///////////// admin route 
app.use('/api/admin/home', adminHomeRoute);
app.use('/api/admin/user/view', adminUserRoute);
app.use('/api/admin/menu/page', adminMenuPageRoute);
app.use('/api/admin/site/setting', adminSiteSettingRoute);
app.use('/api/admin/gateway/manual', adminManualGatewaysRoute);
app.use('/api/admin/crypto/currency', adminCryptoCurrencyRoute);
app.use('/api/admin/trade/setting', adminThradeSettingRoute);
app.use('/api/admin/deposit', adminDepositRoute);
app.use('/api/admin/trade/log', adminTradeLogRoute);
app.use('/api/admin/practice/trade/log', adminPracticeTradeLogRoute);
app.use('/api/admin/withdrawal', adminWithdrawalRoute);
app.use('/api/admin/kyc', adminKYCRoute);
app.use('/api/admin', adminRoleRoute);
app.use('/api/admin/user/trade/log', adminUserTradeLogRoute);
app.use('/api/admin/user/transactions', adminUserTransactionsRoute);
app.use('/api/admin/subscriber/manager', adminSubscriberManagerRoutes);



// user route middleware 
const userSignupEmailVerifyRoute = require('./routes/user/userAuthRoute');


///////////// user route 
app.use('/api/user/auth', userSignupEmailVerifyRoute);


// frontEnd route middleware 
const frontEndHomeRoute = require('./routes/frondEnd/HomeRoutes');
const MenuPageRoute = require('./routes/frondEnd/MenuPageRoutes');
const UserKYCRoute = require('./routes/user/userKYCRoutes');
const UserManualGatewaysRoute = require('./routes/user/PaymentGateways/ManualGatewayRoute');
const UserTradeLogRoute = require('./routes/user/TradeLog/TradeLogRoute');
const UserPracticeTradeLogRoute = require('./routes/user/PracticeTradeLog/PracticeTradeLogRoute');
const UserDepositRoute = require('./routes/user/Deposit/DepositRoute');
const UserWithdrawalRoute = require('./routes/user/Withdrawal/WithdrawalRoute');
const UserNewsletterRoutes = require('./routes/user/Newsletter/NewsletterRoutes');


///////////// frontEnd route 
app.use('/api/frontend/home', frontEndHomeRoute);
app.use('/api/frontend/page', MenuPageRoute);
app.use('/api/kyc/verify', UserKYCRoute);
app.use('/api/user/payment/gateways/manual', UserManualGatewaysRoute);
app.use('/api/user/trade/log', UserTradeLogRoute);
app.use('/api/user/Practice/trade/log', UserPracticeTradeLogRoute);
app.use('/api/user/deposit', UserDepositRoute);
app.use('/api/user/withdrawal', UserWithdrawalRoute);
app.use('/api/user/subscribe', UserNewsletterRoutes);



app.listen(PORT, () => {
    console.log(`server is running at PORT ${PORT}`);
    
});

