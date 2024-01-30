const cookieParser = require('cookie-parser')
const User = require('../../models/userModels');
const userEmailVerifyToken = require('../../models/userEmailVerifyToken');
const UserLoginsModels = require('../../models/UserLogins/UserLoginsModels');
const { ObjectId } = require('mongodb');
const { sendVerifyEmail } = require('../../commonfile/email/UserRegisterEmail');
const { sendForgetPasswordEmail } = require('../../commonfile/email/UserForgetPasswordEmail');
const jwt = require("jsonwebtoken");

const UserSignup = async (req, res) => {

    try {

        const email = req.body.email;
        const existsEmail = await User.findOne({ email: email });
        const existsTokenEmail = await userEmailVerifyToken.findOne({ email: email });

        if (email === undefined) {
            return res.status(400).json({
                success: false,
                message: "Email field is required",
            });
        }


        if (existsEmail) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });

        }



        const codeNumber = Math.floor(10000 + Math.random() * 99999);
        sendVerifyEmail(email, codeNumber);
        const tokenData = { email: req.body.email, verifiy_code: codeNumber };
        if (existsTokenEmail) {
            const filter = { email: email };
            const option = { upsert: true };
            const tokenUpdate = { verifiy_code: codeNumber };
            const data = await userEmailVerifyToken.updateOne(filter, tokenUpdate, option);
            const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "600s" });
            const newData = { email: email, verifiy_code: codeNumber }
            res.status(201).json({
                success: true,
                message: "verify code send successfull",
                data: newData,
                token: token,
            });

        } else {

            const data = await userEmailVerifyToken.create(tokenData);
            const newData = { email: email, verifiy_code: codeNumber }
            const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "600s" });
            res.status(201).json({
                success: true,
                message: "verify code send successfull",
                data: newData,
                token: token,
            });


        }


    } catch (error) {
        console.log(error);
    }



};


const UserSignupVerify = async (req, res) => {
    try {
        const data = req.body;
        // verifiy_code: data.code
        const findCode = await userEmailVerifyToken.findOne({ 'email': data.email, 'verifiy_code': data.code });
        console.log(findCode)
        if (!findCode) {
            return res.status(400).json({
                success: false,
                message: "Invalid code",
            });
        }
        res.status(201).json({
            success: true,
            RegisterEmailSuccess: false,
            message: "verify successfull",
            data: findCode,
        });

    } catch (error) {
        console.log(error);
    }



};

const UserSignupPassword = async (req, res) => {

    try {
        const data = req.body;

        if (data.name === undefined) {
            return res.status(400).json({
                success: false,
                message: "name field is required",
            });
        }
        if (data.name === '') {
            return res.status(400).json({
                success: false,
                message: "name field is required",
            });
        }
        if (data.password === undefined) {
            return res.status(400).json({
                success: false,
                message: "password field is required",
            });
        }
        if (data.password === '') {
            return res.status(400).json({
                success: false,
                message: "password field is required",
            });
        }
        if (data.cpassword === undefined) {
            return res.status(400).json({
                success: false,
                message: "confirm password field is required",
            });
        }
        if (data.cpassword === '') {
            return res.status(400).json({
                success: false,
                message: "confirm password field is required",
            });
        }

        if (data.password !== data.cpassword) {
            return res.status(400).json({
                success: false,
                message: "confirm password not match",
            });
        }

        const userData = { name: data.name, email: data.email, password: data.password, is_verified: true, status: 0, created_at: new Date() }
        await User.create(userData);

        res.status(201).json({
            success: true,
            message: "signup successfull",
            data: userData,
        });

    } catch (error) {
        console.log(error);
    }



};

const UserLogin = async (req, res) => {
    try {
        const data = req.body;
        console.log(data)
        if (data.password === undefined && data.email === undefined) {
            return res.status(400).json({
                success: false,
                message: "email and password field is required",
            });
        }
        if (data.email === undefined || data.email == '') {
            return res.status(400).json({
                success: false,
                message: "email field is required",
            });
        }
        if (data.password === undefined || data.password == '') {
            return res.status(400).json({
                success: false,
                message: "password field is required",
            });
        }



        const existsEmail = await User.findOne({ email: data.email });

        if (!existsEmail) {
            return res.status(400).json({
                success: false,
                message: "Email Invalid",
            });

        } else {
            const existspassword = await User.findOne({ 'email': data.email, 'password': data.password });
            if (!existspassword) {
                return res.status(400).json({
                    success: false,
                    message: "Password Invailid",
                });

            } else {
                let token = jwt.sign({
                    user_email: existsEmail.email,
                    user_id: existsEmail._id,
                },
                    'secret',
                    { expiresIn: '1h' }
                );

                const storeData = {user_name:existspassword.name, user_id:existspassword._id}
                await UserLoginsModels.create(storeData);

                res.status(201).json({
                    success: true,
                    message: "Login successful",
                    data: existsEmail,
                    token: token,
                });

            }
        }





    } catch (error) {
        console.log(error);
    }



};

const UserLoginForm = async (req, res) => {

    try {

        const email = req.body.email;
        const existsEmail = await User.findOne({ email: email });
        console.log(email)
        if (email === undefined) {
            return res.status(400).json({
                success: false,
                message: "Email field is required",
            });
        }
        if (email === '') {
            return res.status(400).json({
                success: false,
                message: "Email field is required",
            });
        }
        // Login section
        if (existsEmail) {
            const newData = { email: email }

            res.status(201).json({
                LoginEmailSuccess: true,
                message: "email verified successfull",
                data: newData,
            });

        } else {//Register section
            const existsTokenEmail = await userEmailVerifyToken.findOne({ email: email });
            const codeNumber = Math.floor(10000 + Math.random() * 99999);
            sendVerifyEmail(email, codeNumber);
            const tokenData = { email: req.body.email, verifiy_code: codeNumber };
            if (existsTokenEmail) {
                const filter = { email: email };
                const option = { upsert: true };
                const tokenUpdate = { verifiy_code: codeNumber };
                const data = await userEmailVerifyToken.updateOne(filter, tokenUpdate, option);
                const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "600s" });
                const newData = { email: email, verifiy_code: codeNumber }
                res.status(201).json({
                    RegisterEmailSuccess: true,
                    message: "verify code send successfull",
                    data: newData,
                    token: token,
                });

            } else {

                const data = await userEmailVerifyToken.create(tokenData);
                const newData = { email: email, verifiy_code: codeNumber }
                const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "600s" });
                res.status(201).json({
                    RegisterEmailSuccess: true,
                    message: "verify code send successfull",
                    data: newData,
                    token: token,
                });


            }


        }


    } catch (error) {
        console.log(error);
    }



};


const UserLoginPassword = async (req, res) => {
    try {
        const data = req.body;

        if (data.password === undefined) {
            return res.status(400).json({
                success: false,
                message: " password field is required",
            });
        }

        if (data.password == '') {
            return res.status(400).json({
                success: false,
                message: "password field is required",
            });
        }



        const existsEmail = await User.findOne({ email: data.email });

        const existspassword = await User.findOne({ 'email': data.email, 'password': data.password });
        if (!existspassword) {
            return res.status(400).json({
                success: false,
                message: "Password Invailid",
            });

        } else {
            let token = jwt.sign({
                user_email: existsEmail.email,
                user_id: existsEmail._id,
            },
                'secret',
                { expiresIn: '1h' }
            );

            const storeData = {user_name:existspassword.name, user_id:existspassword._id}
            await UserLoginsModels.create(storeData);

            res.status(201).json({
                success: true,
                message: "Login successful",
                data: existsEmail,
                token: token,
            });

        }





    } catch (error) {
        console.log(error);
    }


};

const UserPasswordForGet = async (req, res) => {
    try {
        const data = req.body;

        if (data.email === undefined) {
            return res.status(400).json({
                success: false,
                message: "Email field is required",
            });
        }

        if (data.email == '') {
            return res.status(400).json({
                success: false,
                message: "Email field is required",
            });
        }


        const existsEmail = await User.findOne({ email: data.email });

        if (!existsEmail) {
            return res.status(400).json({
                success: false,
                message: "Email not found",
            });
        } else {
            const secret = process.env.JWT_SECRET + existsEmail._id;
            const token = jwt.sign({ email: existsEmail.email, id: existsEmail._id }, secret, {
                expiresIn: "5m",
            });
            sendForgetPasswordEmail(existsEmail?.email, existsEmail?.name, existsEmail?._id, token)
            res.status(201).json({
                success: true,
                message: "Check your email inbox",
            });
        }



    } catch (error) {
        console.log(error);
    }


};
const UserPasswordReset = async (req, res) => {
    try {
        const { id, token } = req.params;
        const data = req.body;
        const filter = { _id: new ObjectId(id) };
        const existsEmail = await User.findOne(filter);

        const secret = process.env.JWT_SECRET + existsEmail._id;

        jwt.verify(token, secret, function (err, decoded) {
            if (err) {
                return res.status(400).json({
                    token_success: false,
                    message: "Token Expired",
                });
            }
        });


        if (!(data.password === data.cpassword)) {
            return res.status(400).json({
                success: false,
                message: "password and confirm password does not match",
            });
        }
        const userData = { password: data?.password };
        const option = { upsert: true };
        await User.findByIdAndUpdate(filter, userData, option);
        res.status(201).json({
            success: true,
            message: "password change successfully",
        });

    } catch (error) {
        console.log(error);
    }


};
 

// count user 

// var query = User.find(); 
// query.count(function (err, count) { 
//     if (err) console.log(err) 
//     else console.log("Count is", count) 
// });

module.exports = { UserSignup, UserSignupVerify, UserSignupPassword, UserLogin, UserLoginForm, UserLoginPassword, UserPasswordForGet, UserPasswordReset };
