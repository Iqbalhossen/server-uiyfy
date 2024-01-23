const express = require('express')
const route = express.Router();

const {UserSignup, UserSignupVerify, UserSignupPassword, UserLogin, UserLoginForm , UserLoginPassword, UserPasswordForGet, UserPasswordReset} = require('./../../controller/user/userAuthenticationController');
const {userEmailVerifyToken } = require('../../middlewares/userEmailVerifyToken');

route.post('/signup/email',  UserSignup);
route.post('/signup/email/verify', userEmailVerifyToken, UserSignupVerify);
route.post('/signup', UserSignupPassword);
route.post('/login', UserLogin);
route.post('/mobile/login', UserLoginForm);
route.post('/mobile/login/password', UserLoginPassword);
route.post('/passowrd/forget', UserPasswordForGet);
route.post('/passowrd/reset/:id/:token', UserPasswordReset);


module.exports = route;