import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { redisClient } from '../utils/redisClient.js'
import { companyModel } from '../models/companySchema.js'

dotenv.config({ path: "./config.env" })

// email setup
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_EMAIL_PASSWORD,
    }
})

// create a random number
function generateRandomNumber() {
    return Math.floor((Math.random() * 9000) + 1000)
}

// send otp just after the registration
async function sendOTP(email) {
    try {
        let otp = generateRandomNumber()
        let emailOptions = {
            from: process.env.USER_EMAIL,
            to: email,
            subject: 'Verify your company email address using OTP',
            html: `<h1 style="font-weight:normal">Hello, please use this OTP <strong>${otp}</strong> to verify your account. This code is valid for 5 minutes.</h1>`
        }
        await transporter.sendMail(emailOptions)
        await redisClient.setEx(`companyEmail:${email}`, 300, otp.toString())
        return { message: "OTP sent successfully!", status: true }
    } catch (err) {
        console.log("Error sending company OTP:", err)
        return { message: "Unable to send OTP!", status: false }
    }
}


// send otp for password reset
async function sendOTPForPasswordReset(email) {
    try {
        let otp = generateRandomNumber()
        let emailOptions = {
            from: process.env.USER_EMAIL,
            to: email,
            subject: 'Company Password Reset Request',
            html: `<h1 style="font-weight:normal;font-style:italic">Your OTP is <b>${otp}</b>. It is valid for 5 minutes. Use this OTP to reset your company password.</h1>`
        }

        await transporter.sendMail(emailOptions)
        await redisClient.setEx(`companyPasswordReset:${email}`, 300, otp.toString())

        return { message: 'OTP sent successfully!', status: true }
    } catch (err) {
        console.log('Error sending company password reset OTP:', err)
        return { message: 'Unable to send OTP!', status: false }
    }
}

// register company
const companyRegister = async (req, res) => {
    try {
        let { companyName, email, password, contactEmailOrPhone, address, website, industryType, companySize, description, postedJobs } = req.body

        if (!companyName || !email || !password || !contactEmailOrPhone || !address || !industryType)
            throw ("invalid/missing data!")

        // Check if company already exists
        let existingCompany = await companyModel.findOne({
            $or: [{ "email.companyEmail": email }, { "contactEmailOrPhone": contactEmailOrPhone }]
        })

        if (existingCompany) throw ("Company already registered! Please use a different email/phone.")

        let emailObject = {
            companyEmail: email,
            verify: false
        }

        // Send OTP
        let otpResult = await sendOTP(email)
        if (!otpResult.status) throw (`Unable to send OTP at ${email} | ${otpResult.message}`)

        // Create new company entry
        let newCompany = new companyModel({
            companyName,
            email: emailObject,
            password,
            contactEmailOrPhone,
            address,
            website,
            industryType,
            companySize,
            description,
            postedJobs
        })

        await newCompany.save()

        res.status(202).json({
            message: `Company registered successfully! Please verify the email using the OTP sent to ${email}.`
        })
    } catch (err) {
        console.log("Error while registering company:", err)
        res.status(400).json({ message: "Unable to register company!", err })
    }
}

// verification of the otp just after registration
const companyOTPVerification = async (req, res) => {
    try {
        let { email, companyOtp } = req.body

        let companyExists = await companyModel.findOne({ "email.companyEmail": email })
        if (!companyExists) throw (`Email ${email} is not registered!`)

        let storedOtp = await redisClient.get(`companyEmail:${email}`)
        if (!storedOtp) throw ("OTP expired/not found!")
        if (storedOtp != companyOtp) throw ("Invalid OTP!")

        await companyModel.updateOne(
            { "email.companyEmail": email },
            { $set: { "email.verify": true } }
        )

        await redisClient.del(`companyEmail:${email}`)

        res.status(202).json({ message: "OTP verified successfully! You can now log in." })
    } catch (err) {
        console.log("Error verifying company OTP:", err)
        res.status(500).json({ message: "Failed to verify company OTP!", err })
    }
}

//company logged in
const companyLogin = async (req, res) => {
    try {
        let { email, password } = req.body

        if (!email || !password) throw ({ message: "Incomplete/invalid data", status: 400 })

        let company = await companyModel.findOne({ "email.companyEmail": email })
        if (!company) throw ({ message: `Company not found with email ${email}. Please register first.`, status: 404 })

        let validPassword = await bcrypt.compare(password, company.password)
        if (!validPassword) throw ({ message: "Incorrect email/password!", status: 401 })

        let payload = { "email.companyEmail": email }
        let token = await jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: "0.25hr" })

        res.status(202).json({ message: "Login successful!", token })
    } catch (err) {
        console.log("Error while company login:", err)
        res.status(err.status || 401).json({
            message: err.message || "Unable to login at this moment. Please try again later!",
            err
        })
    }
}

// password reset request
const companyResetPasswordRequest = async (req, res) => {
    try {
        let { email } = req.body
        if (!email) throw ("invalid/incomplete data!")

        let companyExists = await companyModel.findOne({ "email.companyEmail": email })
        if (!companyExists) throw ("Invalid email address / Please register first!")

        let result = await sendOTPForPasswordReset(email)
        if (!result.status) throw (`Unable to send OTP at ${email} | ${result.message}`)

        res.status(201).json({ message: `An OTP has been sent to your email ${email}. Valid for 5 minutes.` })
    } catch (err) {
        console.log("Company password reset request failed:", err)
        res.status(400).json({ message: "Password reset request failed!", err })
    }
}

// verify password reset request
const companyOTPForPasswordReset = async (req, res) => {
    try {
        let { email, companyOtp, newPassword } = req.body

        let companyExists = await companyModel.findOne({ "email.companyEmail": email })
        if (!companyExists) throw (`Email ${email} is not registered!`)

        let storedOtp = await redisClient.get(`companyPasswordReset:${email}`)
        if (!storedOtp) throw ("OTP expired/not found!")
        if (storedOtp != companyOtp) throw ("Invalid OTP!")

        let hash = await bcrypt.hash(newPassword, 10)
        await companyModel.updateOne({ "email.companyEmail": email }, { $set: { "password": hash } })

        await redisClient.del(`companyPasswordReset:${email}`)

        res.status(202).json({ message: "Password reset successfully! Please login with your new password." })
    } catch (err) {
        console.log("Error while verifying OTP for company password reset:", err)
        res.status(500).json({ message: "Failed to reset password. Please try again later!", err })
    }
}

export { companyRegister, companyOTPVerification, companyLogin, companyResetPasswordRequest, companyOTPForPasswordReset}

    // companyRegister,  // new registration
    // companyOTPVerification,   // otp verification
    // companyLogin, // company login
    // companyResetPasswordRequest, //initiate reset password request
    // companyOTPForPasswordReset // verify reset password request
