import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { redisClient } from '../utils/redisClient.js'
import { userModel } from '../models/userSchema.js'

dotenv.config({ path: "./config.env" })


// for sending otp mail using gmail for new registration
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',   // Gmail SMTP
    port: 465,                // 465 for SSL, 587 for STARTTLS
    secure: true,             // true for 465, false for 587
    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_EMAIL_PASSWORD,
    }
})

// create random number
function generateRandomNumber() {
    return Math.floor((Math.random() * 9000) + 1000)
}

// send otp for registration using created random number
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

// send OTP for new password reset
async function sendOTPForPasswordReset(email) {
    try {
        let otp = generateRandomNumber()
        let emailOptions = {
            from: process.env.USER_EMAIL,
            to: email,
            subject: "Password Reset Request",
            html: `<h1 style="font-weight:normal;font-style:italic">Your OTP is <b>${otp}</b>. It is valid for 5 minutes. <u>Use this OTP to reset your password</u>.</h1>`
        }
        await transporter.sendMail(emailOptions)
        await redisClient.setEx(`emailPasswordReset:${email}`, 300, otp.toString())

        return { message: 'OTP send successfully!', status: true }
    } catch (err) {
        console.log('Error sending otp for password reset :', err)
        return { message: 'Unable to send OTP!', status: false }
    }
}

// user registration
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
        res.status(400).json({ message: "Unable to register user !", err })
    }
}

// email otp verification
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

//user login 
let handleUserLogin = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password)
      throw { message: "Incomplete/invalid data", status: 400 };

    let user = await userModel.findOne({ "email.userEmail": email });
    if (!user)
      throw {
        message: `User not found with email ${email}. Please register first.`,
        status: 404,
      };

    let validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      throw { message: "Incorrect email/password!", status: 401 };

    let payload = { email };

    // Token expiry: 15 minutes (or 0.25h)
    let token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
      expiresIn: "15m",
    });

    res.status(202).json({ message: "Login successful!", token });
  } catch (error) {
    console.log("Error while login:", error);
    res
      .status(error.status || 401)
      .json({
        message:
          error.message ||
          "Unable to login at this moment. Please try again later!",
        error,
      });
  }
};



//  user reset request
const handleResetPasswordRequest = async (req, res) => {
    try {
        let { email } = req.body

        if (!email) throw ("invalid/incomplete data !")

        let userExists = await userModel.findOne({ "email.userEmail": email })
        if (!userExists) throw ("invalid email address / Please register first !")

        let result = await sendOTPForPasswordReset(email)
        if (!result.status) throw (`unable to send otp at ${email} | ${result.message}`)

        res.status(201).json({ message: `An OTP sent to your email ${email}. It is valid for 5 minutes.` })

    } catch (err) {
        console.log("password reset request failed !", err)
        res.status(400).json({ message: "password reset request failed !", err })
    }
}


//verify otp and reset password
const handleOTPForPasswordReset = async (req, res) => {
    try {
        let { email, userOtp, newPassword } = req.body

        let emailExists = await userModel.findOne({ "email.userEmail": email })
        if (!emailExists) throw (`email ${email} is not registered !`)

        let storedOtp = await redisClient.get(`emailPasswordReset:${email}`)
        if (!storedOtp) throw ("otp expired/not found !")
        if (storedOtp != userOtp) throw ("invalid otp !")

        let hash = await bcrypt.hash(newPassword, 10)
        await userModel.updateOne({ "email.userEmail": email }, { $set: { "password": hash } })
        redisClient.del(`emailPasswordReset:${email}`)

        res.status(202).json({ message: "Password reset successfully. Please login with your new password!" })

    } catch (err) {
        console.log("error while verifying the otp for password reset : ", err)
        res.status(500).json({ message: "Failed to reset password. Please try again later!", err })
    }
}


let handleUserFileUpload = async (req, res) => {
  try {
    if (!req.file) throw new Error("Failed to upload a file!");

    let fileName = req.file.filename;
    let fileType = req.params.file_type; // 'resume' or 'profile_picture' or 'logo'

    // Declare updateField before using it
    let updateField;

    if (fileType === "resume") {
      updateField = { $push: { document: fileName } };
    } else if (fileType === "profile_picture") {
      updateField = { $set: { profile_picture: fileName } };
    } 
    else {
      throw new Error("Invalid file type. Only 'resume', 'profile_picture', or 'logo' are allowed.");
    }

    // Update the user document
    const result = await userModel.updateOne(
      { "email.userEmail": req.user?.email?.userEmail },
      updateField
    );

    if (result.modifiedCount === 0) {
      throw new Error("User not found or file not saved.");
    }

    const uploadDest = `upload/${fileType}/${fileName}`;

    res.status(202).json({
      message: `${fileType === "resume" ? "Resume" : "Profile picture"} uploaded successfully!`,
      fileName,
      uploadDest,
    });

  } catch (err) {
    console.error("Error in handleUserFileUpload:", err);
    res.status(500).json({
      message: "Failed to upload the file.",
      error: err.message || err,
    });
  }
};














export { handleUserRegister, handleOTPVerification, handleUserLogin, handleResetPasswordRequest, handleOTPForPasswordReset,handleUserFileUpload}