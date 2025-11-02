import express from  'express'
import {handleUserRegister, handleOTPVerification, handleUserLogin, handleResetPasswordRequest,handleOTPForPasswordReset } from '../controllers/userController.js'

let userRouter = express.Router()

userRouter.post("/register",handleUserRegister)
userRouter.post("/verify-otp",handleOTPVerification)
userRouter.post("/login",handleUserLogin)
userRouter.post("/password-reset-request", handleResetPasswordRequest)
userRouter.post("/verify-password-reset", handleOTPForPasswordReset)

export {userRouter}