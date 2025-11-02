import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { redisClient } from '../utils/redisClient.js'
import { userModel } from '../models/userSchema.js'


dotenv.config({ path: "./config.env" })


// for sending otp mail using gmail
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',   // Gmail SMTP
    port: 465,                // 465 for SSL, 587 for STARTTLS
    secure: true,             // true for 465, false for 587
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_EMAIL_PASSWORD,
    }
})


function generateRandomNumber() {
    return Math.floor((Math.random() * 9000) + 1000)
}

async function sendOTP(email) {
    try {
        let otp = generateRandomNumber()
        let emailOptions = {
            from: process.env.USER_EMAIL,
            to: email,
            subject: 'Verify your email address using OTP',
            html: ` <h1 style='font-weight:normal'> Hello, Use the OTP below to complete your action. For security reasons this code is valid for 5 minutes from the time it was issued <strong>${otp}</strong> .<h1>`
        }
        await transporter.sendMail(emailOptions)

        // Convert OTP to string before storing
        await redisClient.setEx(`email:${email}`, 300, otp.toString())

        return { message: "otp sent successfully !", status: true }
    } catch (err) {
        console.log("error sending otp : ", err)

        return { message: "unable to send otp !", status: false }
    }
}


let handleUserRegister = async (req, res) => {
    try {
        let { name, phone, email, address, dob, password, qualifications } = req.body

        if (!name || !phone || !email || !address || !dob || !password || !qualifications) throw ("invalid/missing data !")

        // check if user exits
        let checkIfUserExits = await userModel.findOne({
            $or: [{ "email.userEmail": email }, { "phone": phone }]
        })

        // if found then error
        if (checkIfUserExits) throw ("uanble to register user please change email/phone and try again !")

        let emailObject = {
            userEmail: email, verified: false
        }

        // to send otp

        let result = await sendOTP(email)

        if (!result.status) throw (`unable to send otp at ${email} | ${result.message}`)

        // create user object

        // encrypt password
        let newUser = new userModel({ name, phone, email: emailObject, address, dob, qualifications, password })

        // save user object
        await newUser.save();

        // exit
        res.status(202).json({ message: `user registered successfully please verify the email using otp that is sent on email ${email}` })

    } catch (err) {
        console.log("error while registering user : ", err)
        res.status(400).json({ message: "unable to register user !", err })
    }
}

let handleOTPVerification = async (req, res) => {
    try {
        let { email, userOtp } = req.body

        //check if email exit
        let emailExits = await userModel.findOne({
            "email.userEmail": email
        })

        if (!emailExits) throw (`email ${email} is not registred !`)

        let storeOtp = await
            redisClient.get(`email:${email}`)

        if (!storeOtp) throw ("otp is expried/not found !")

        if (storeOtp != userOtp) throw ("invalid otp !")

        console.log('otp matched successfully !')

        // change verification status to true
        let updateUserObject = await userModel.updateOne(
            { "email.userEmail": email }, { $set: { "email.verified": true } })

        console.log(updateUserObject)

        // remove the temp otp

        redisClient.del(`email:${email}`)

        res.status(202).json({ message: "otp verified successfully please head to login !" })

    } catch (err) {
        console.log("error while verifying the otp : ", err)
        res.status(500).json({ message: "failed to verify user otp please try again later !", err })

    }
}


let handleUserLogin = async (req, res) => {
    try {
        let { email, password } = req.body

        if (!email || !password) throw ({ message: `Incomplete/invalid data`, status: 400 })

        let user = await userModel.findOne({ "email.userEmail": email })

        if (!user) throw ({ message: `user not found with email ${email}. Please register the user first.`, status: 404 })

        let validPassword = await bcrypt.compare(password, user.password)

        if (!validPassword) throw ({ message: `incorret email/password !`, status: 401 })

        let playLoad = { "email.userEmail": email }

        let token = await jwt.sign(playLoad
            , process.env.JWT_SECRET_KEY, { expiresIn: "0.25hr" })

        res.status(202).json({ message: "login successfull !", token })


    } catch (error) {
        console.log("error while login : ", error)
        res.status(error.status || 401).json({ message: error.message || "unable to login at this moment. Please try again later !", error })
    }
}

export { handleUserRegister, handleOTPVerification, handleUserLogin }