import express from  'express'
import {handleUserRegister, handleOTPVerification, handleUserLogin} from '../controllers/userController.js'

let userRouter = express.Router()

userRouter.post("/register",handleUserRegister)
userRouter.post("/verify-otp",handleOTPVerification)
userRouter.post("/login",handleUserLogin)

export {userRouter}