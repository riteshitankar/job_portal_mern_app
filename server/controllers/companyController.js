import nodemailer from "nodemailer"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { companyModel } from "../models/companySchema.js"
import { redisClient } from "../utils/redisClient.js"

dotenv.config({ path: "./config.env" })

// to send a email we need a transporter 

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',   // Gmail SMTP
  port: 465,                // 465 for SSL, 587 for STARTTLS
  secure: true,             // true for 465, false for 587
  auth: {
    user: process.env.COMPANY_EMAIL,
    pass: process.env.COMPANY_EMAIL_PASSWORD,
  }
})

function generateRandomNumber() {
  return Math.floor((Math.random() * 9000) + 1000)
}

async function sendOTP(email) {
  try {
    let otp = generateRandomNumber()

    // style otp 
    let emailOptions = {
      from: process.env.COMPANY_EMAIL,
      to: email,
      subject: "Verify your company email ",
      html : `<h1>Use the OTP <i>${otp}</i>to verify your company email | OTP valid for 5 mins</h1>`
    }

    await transporter.sendMail(emailOptions)

    redisClient.setEx(`email:${email}`, 300, otp.toString())

    return { message: "OTP sent successfully !", status: true }

  } catch (err) {
    console.log("error sending otp : ", err)
    return { message: "unable to send otp !", status: false }
  }
}

async function sendOTPForPasswordReset(email) {
  try {
    let otp = generateRandomNumber()

    let emailOptions = {
      from: process.env.COMPANY_EMAIL,
      to: email,
      subject: "Password Reset Request !",
      html: `<h1>Your password reset otp is ${otp} .</h1>`}

    await transporter.sendMail(emailOptions)

    redisClient.setEx(`emailPasswordReset:${email}`, 300, otp.toString())

    return { message: "otp sent successfully !", status: true }



  } catch (err) {
    console.log("error sending otp : ", err)
    return { message: "unable to send otp !", status: false }

  }
}

let handleCompanyRegister = async (req, res) => {
  try {
    let { companyDetails,
      contactPerson,
      email,
      password,
      phone,
      companyLogo,
      documents,
      createJobs } = req.body;

    if (!companyDetails || !contactPerson || !email || !password || !phone || !companyLogo || !documents || !createJobs) throw ("Invalid or missing data!")

    // check if company exits
    let checkIfCompanyExists = await companyModel.findOne({
      $or: [{ "email.companyEmail": email }, { "phone": phone }]
    })

    // if found then error
    if (checkIfCompanyExists) throw ("uanble to register company please change email/phone and try again !")

    let emailObject = {
      companyEmail: email, verified: false
    }

    // to send otp

    let result = await sendOTP(email)

    if (!result.status) throw (`unable to send otp at ${email} | ${result.message}`)

    // create company object

    // encrypt password before saving

    let hash = await bcrypt.hash(password, 10)


    let newCompany = new companyModel({
      companyDetails,
      contactPerson,
      email: emailObject,
      phone,
      password,
      companyLogo,
      documents,
      createJobs
    })

    await newCompany.save();

    // exit
    res.status(202).json({ message: `Company registered successfully please verify the email using otp that is sent on email ${email}` })


  } catch (err) {

    console.log("error while registering company : ", err)
    res.status(400).json({ message: "unable to register company !", err })
  }
}

let handleOTPVerification = async (req, res) => {
  try {

    let { email, companyOtp } = req.body

    //check if email exit
    let emailExits = await companyModel.findOne({
      "email.companyEmail": email
    })

    if (!emailExits) throw (`email ${email} is not registred !`)

    let storeOtp = await
      redisClient.get(`email:${email}`)

    if (!storeOtp) throw ("otp is expried/not found !")

    if (storeOtp.toString() !== companyOtp.toString()) throw ("invalid otp !")

    console.log('otp matched successfully !')

    // change verification status to true
    let updateCompanyObject = await companyModel.updateOne(
      { "email.companyEmail": email }, { $set: { "email.verified": true } })

    console.log(updateCompanyObject)

    // remove the temp otp

    redisClient.del(`email:${email}`)

    res.status(202).json({ message: "otp verified successfully please head to login !" })

  } catch (err) {
    console.log("error while verifying the otp : ", err)
    res.status(500).json({ message: "failed to verify company otp please try again later !", err })

  }
}

let handleCompanyLogin = async (req, res) => {
  try {
    let { email, password } = req.body

    let companyExists = await companyModel.findOne({
      "email.companyEmail": email
    })

    if (!companyExists) throw ("unable to find the email please register the company first !")

    if (!companyExists.email.verified) {
      //to send otp
      let result = await sendOTP(email)

      if (!result.status) throw (`unable to send otp at ${email} | ${result.message}`)

      // redirect company to email verification route

      throw (`Company email is not verfied we have sent an otp at ${email} please verify your email !`)

    }

    //compare password 

    let result = await bcrypt.compare(password, companyExists.password)

    if (!result) throw ("invalid email/password !")

    // create jwt and send to company

    let token = await jwt.sign({ email }, process.env.COMPANY_JWT_SECRET_KEY, { expiresIn: "24hr" })

    res.status(202).json({ message: `welcome company ${companyExists.companyDetails.name} ! login was successfull.`, token })




  } catch (err) {
    console.log("error while login : ", err)
    res.status(400).json({ message: "unable to login", err })

  }
}

let handleResetPasswordRequest = async (req, res) => {
  try {

    let { email } = req.body

    if (!email) throw ("invalid/incomplete data !")

    let companyExists = await companyModel.findOne({ "email.companyEmail": email })

    // console.log(userExists)

    if (!companyExists) throw ("invalid email address/Please register first !")

    let result = await sendOTPForPasswordReset(email)

    console.log(result)

    if (!result.status) throw (`unable to send otp at ${email} | ${result.message}`)

    res.status(201).json({ message: `An OTP sent to your email ${email} | valid for 5 mins to reset your password !` })


  } catch (err) {
    console.log("password reset request failed !", err)
    res.status(400).json({ message: "password reset request failed !", err })

  }
}

let handleOTPForPasswordReset = async (req, res) => {
  try {
    let { email, companyOtp, newPassword } = req.body;

    if (!email || !companyOtp || !newPassword)
      return res.status(400).json({ message: "Email, OTP and new password are required!" });

    //check if email exits
    let emailExits = await companyModel.findOne({ "email.companyEmail": email })

    if (!emailExits) throw (`email ${email} is not registerd !`)

    let storedOtp = await redisClient.get(`emailPasswordReset:${email}`)

    if (!storedOtp) throw ("otp is expried/not found !")

    if (storedOtp.toString().trim() !== companyOtp.toString().trim()) throw ("invalid otp !");

    console.log('otp matched successfully for password reset !')

    // encrypt

    let hash = await bcrypt.hash(newPassword, 10)

    // change verification status to true
    let updateCompanyObject = await companyModel.updateOne({ "email.companyEmail": email },
      { $set: { "password": hash } })

    console.log("Password updated:", updateCompanyObject)

    // remove the temprary otp
    redisClient.del(`emailPasswordReset:${email}`)

    res.status(202).json({ message: "otp verified successfully and password has been changed please head to login !" })

  } catch (err) {
    console.log("error while verifying the otp : ", err)
    res.status(500).json({ message: "failed to verify company otp please try again later !", err })
  }

}

let handleResetPasswordRequestOldToNew = async (req, res) => {
  try {
    const { email, oldPassword, newPassword, confirmPassword } = req.body;

    // check valid inputs
    if (!email || !oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Incomplete data provided!" });
    }


    //  Check if company exists
    const company = await companyModel.findOne({ "email.companyEmail": email });

    if (!company) throw (`Company with email ${email} not found!`)


    // Compare old password
    let isOldPasswordCorrect = await bcrypt.compare(oldPassword, company.password);
    if (!isOldPasswordCorrect) throw ("Old password is incorrect!")


    // Check newPassword == confirmPassword
    if (newPassword !== confirmPassword)
      throw ("New password and Confirm password do not match!")

    // if check the old and new password does not same
    const isSameAsOld = await bcrypt.compare(newPassword, company.password);
    if (isSameAsOld)
      throw ("New password cannot be the same as the old password!")

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await companyModel.updateOne(
      { "email.companyEmail": email },
      { $set: { password: hashedPassword } }
    );

    return res.status(200).json({
      message: "Password changed successfully! Please login again.",
    });

  } catch (err) {
    console.error("Error while changing password:", err);
    res.status(500).json({
      message: "Failed to change password. Please try again later.",
      error: err.message,
    });
  }
}

let handleCompanyFileUpload = async (req, res) => {
  try {
    if (!req.file) throw new Error("Failed to upload a file!");

    let fileName = req.file.filename
    let fileType = req.params.file_type // 'resume' , 'profile_pictures' or "company_logo"

    // Determine which field to update

    let updateField = {}

    if (fileType === "logo") {
      updateField = { $set: { company_logos: fileName } }
    } else {
      throw new Error("Invalid file type. Only 'company_logos' is allowed.");
    }

    // Update the company document
    const result = await companyModel.updateOne(
      { "email.companyEmail": req.company.email.companyEmail },
      updateField
    );

    if (result.modifiedCount === 0) {
      throw new Error("Company not found or file not saved.");
    }

    const uploadDest = `upload/${fileType}/${fileName}`;

    res.status(202).json({
      message: `${fileType === "logo"
            ? "company_logos"
            : "File"
        } uploaded successfully!`,

      fileName,
      uploadDest,
    });

  } catch (err) {
    console.error("Error in handleCompanyFileUpload:", err);
    res.status(500).json({
      message: "Failed to upload the file.",
      error: err.message || err,
    });

  }
}







export { handleCompanyRegister, handleOTPVerification, handleCompanyLogin }
export { handleResetPasswordRequest, handleOTPForPasswordReset }
export { handleResetPasswordRequestOldToNew }
export { handleCompanyFileUpload }
