const User = require('../models/user')
const { errorCode, errorHandler,errorHandler2 } = require('../helpers/errorHandler')
const jwt = require('jsonwebtoken')
const { expressjwt: expressJwt } = require("express-jwt"); // for authorization
const { sendEmail } = require('../helpers/nodeMailer')

exports.signup = (req, res) => {
    let { name, phone,username, password } = req.body
    phone=Number(phone)
    if (!name,!username, !password, !phone) {
        return errorCode(res, 400, "all field required")
    }
    User.findOne({ phone }).exec((err, existphone) => {
        if (existphone) {
            return errorCode(res, 400, 'this number is taken already')
        }
        const newUser = new User({ name,username, phone, password});
        newUser.save((err, user) => {
            if (err) {
                // console.log(err)
                return err.code === 11000 ?
                    errorCode(res, 400, errorHandler2(err))
                    :
                    errorCode(res, 400, errorHandler(err))
            }
            res.json({ message: "Signup success! Please signin." })
        })
    })
}

exports.signin = (req, res) => {
    let { phone, password } = req.body
    User.findOne({phone}, (err, user) => {
        if (err || !user) {
            return errorCode(res, 401, "User with that number does not exist.");
        }
        //authenticate method in user model
        if (!user.authenticate(password)) {
            return errorCode(res, 401, "Number and password don't match")
        }
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '9d' });
        const { _id,username, name, role } = user;
        return res.json({
            token,
            user: { _id,username, name, role },
            message: "Signin Success"
        })
    }
    )
}

exports.requireSignin = expressJwt({
    secret: process.env.JWT_SECRET,
    userProperty: 'auth',
    algorithms: ["HS256"]
})

exports.authMiddleware = (req, res, next) => {
    const userId = req.auth._id;
    User.findById({ _id: userId }, ((err, user) => {
        if (err || !user) {
            return errorCode(res, 400, "user not found")
        }
        req.profile = user;
        next()
    }))
}
exports.adminMiddleware = (req, res, next) => {
    const userId = req.auth._id;
    User.findById({ _id: userId }, ((err, user) => {
        if (err || !user) {
            return errorCode(res, 400, "user not found")
        }
        if (user.role !== 1) {
            return errorCode(res, 401, 'Admin resource. Access denied')
        }
        req.profile = user;
        next()
    }))
}

exports.forgotPassword = (req, res) => {
    const { email } = req.body;
    User.findOne({ email }, (err, user) => {
        if (err) {
            return errorCode(res, 400, "User with that email does not exist")
        }
        const token = jwt.sign({ _id: user._id }, process.env.JWT_RESET_PASSWORD, { expiresIn: '10m' });

        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Password reset link`,
            html: `
            <p>Please use the following link to reset your password:</p>
            <p>${process.env.CLIENT_URL}/auth/password/reset/${token}</p>
            <hr />
            <p>This email may contain sensetive information</p>
            <p>https://example.com</p>
            `
        }
        return user.updateOne({ resetPasswordLink: token },
            (err, success) => {
                if (err) {
                    return errorCode(res, 400, errorHandler(err))
                }
                sendEmail(emailData).then(sent => {
                    return res.json({
                        message: `Email has been sent to ${email}. Follow the instructions to reset your password. Link expires in 10min.`
                    });
                });
            }
        )


    })
}

exports.resetPassword = (req, res) => {
    const { resetPasswordLink, newPassword } = req.body;
    if (resetPasswordLink) {
        jwt.verify(resetPasswordLink, process.env.JWT_RESET_PASSWORD,
            function (err, decode) {
                if (err) {
                    return errorCode(res, 400, "Expired Link, Try Again")
                }
                // console.log(decode)
                User.findOne({ _id: decode._id }, (err, user) => {
                    if (err) {
                        return errorCode(res, 400, "user not found")
                    }
                    user.password = newPassword;
                    user.resetPasswordLink = '';

                    user.save((err, result) => {
                        if (err) {
                            return errorCode(res, 400, errorHandler(err))
                        }
                        res.json({
                            message: `Great! Now you can login with your new password`
                        });
                    })
                })
            }
        )
    }
}

