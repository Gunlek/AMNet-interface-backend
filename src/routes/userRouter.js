let express = require('express');
const { UserCancelPayment } = require('../users/userCancelPayment');
const { UserChangePassword } = require('../users/userChangePassword');
const { UserDisconnect } = require('../users/userDisconnect');
const { UserDoPayment } = require('../users/userDoPayment');
const { UserLogin } = require('../users/userLogin');
const { UserLostPassword } = require('../users/userLostPassword');
const { UserPaymentSuccess } = require('../users/userPaymentSuccess');
const { UserProcessLogin } = require('../users/userProcessLogin');
const { UserProcessLostPassword } = require('../users/userProcessLostPassword');
const { UserProcessProfileUpdate } = require('../users/userProcessProfileUpdate');
const { UserProcessSignin } = require('../users/userProcessSignin');
const { UserProfile } = require('../users/userProfile');
const { UserSignin } = require('../users/userSignin');
const { UserSuccessCotizPayment } = require('../users/userSuccessCotizPayment');
const { UserUpdatePassword } = require('../users/userUpdatePassword');

let userRouter = express.Router();

// Password
userRouter.get('/lost_password/', UserLostPassword);
userRouter.post('/process_lost_password/', UserProcessLostPassword);
userRouter.get('/change_password/:token', UserChangePassword);
userRouter.post('/update_password', UserUpdatePassword);

// Log-in
userRouter.get('/login', UserLogin);
userRouter.post('/process_login/', UserProcessLogin);

// Sign-in
userRouter.get('/signin', UserSignin);
userRouter.post('/process_signin/', UserProcessSignin);

// Disconnection
userRouter.get('/disconnect', UserDisconnect);

// Profile
userRouter.get('/profile/', UserProfile);
userRouter.post('/process-profile-update/', UserProcessProfileUpdate);

// Lydia transactions
userRouter.get('/payment/do/:user_phone', UserDoPayment);
userRouter.get('/payment/do/', (req, res) => { res.redirect('/user/profile/?phone_err=1'); });
userRouter.get('/success-cotiz-payment/', UserSuccessCotizPayment);
userRouter.post('/payment/success/:ticket_id', UserPaymentSuccess);
userRouter.post('/payment/cancel/:ticket_id', UserCancelPayment);

module.exports = userRouter;
