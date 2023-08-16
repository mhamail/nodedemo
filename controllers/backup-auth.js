const User = require('../models/user')
const { errorCode, errorHandler } = require('../helpers/errorHandler')
const jwt = require('jsonwebtoken')
const { expressjwt: expressJwt } = require("express-jwt"); // for authorization
const { sendEmail } = require('../helpers/nodeMailer')

exports.preSignup = (req, res) => {
    const { username, name, email,phone, password } = req.body;

    if (!username, !name, !email, !password, !phone) {
        return errorCode(res, 400, "all field required")
    }

    User.findOne({ username }).exec((err, existUser) => {
        if (existUser) {
            return errorCode(res, 400, 'username is taken')
        }

        User.findOne({ email: email.toLowerCase() }, (err, existUser) => {
            if (existUser) {
                return errorCode(res, 400, 'Email is taken')
            }
            const token = jwt.sign({ username, name, email,phone, password }, process.env.JWT_ACCOUNT_ACTIVATION, { expiresIn: '10m' });
            const emailData = {
                from: process.env.EMAIL_FROM,
                to: email,
                subject: `Account activation link`,
                html: `
            <p>Please use the following link to activate your account:</p>
            <p>${process.env.CLIENT_URL}/auth/accountActivate/${token}</p>
            <hr />
            <p>This email may contain sensetive information</p>
            <p>https://example.com</p>
        `
            };
            sendEmail(emailData).then(sent => {
                return res.json({
                    message: `Email has been sent to ${email}. Follow the instructions to activate your account.`
                });
            });
        })
    })
}

exports.signup = (req, res) => {
    const token = req.body.token;
    if (token) {
        jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION,
            function (err, decoded) {
                if (err) {
                    return errorCode(res, 400, "Expired Link, Signup Again")
                }
                const { username, name, email,phone, password } = jwt.decode(token)
                const newUser = new User({ username, name, email,phone, password });
                newUser.save((err, user) => {
                    if (err) {
                        return errorCode(res, 400, errorHandler(err))
                    }
                    res.json({ message: "Signup success! Please signin." })
                })
            })
    }



}

exports.signin = (req, res) => {
    const { username, email, password } = req.body;
    User.findOne(email ? { email } : { username }, (err, user) => {
        if (err || !user) {
            return errorCode(res, 401, "User with that email does not exist.");
        }

        //authenticate method in user model
        if (!user.authenticate(password)) {
            return errorCode(res, 401, "Email and password don't match")
        }
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '9d' });
        const { _id, username, email, name, role } = user;
        return res.json({
            token,
            user: { _id, username, email, name, role },
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

