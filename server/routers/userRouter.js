import express from  'express'

import {handleUserRegister, handleOTPVerification, handleUserLogin, handleResetPasswordRequest,handleOTPForPasswordReset, fetchProfile } from '../controllers/userController.js'

import { handleUserFileUpload } from "../controllers/userController.js"

import { upload } from "../config/multerConfig.js"

let userRouter = express.Router()
import AuthUser from "../middleware/AuthUser.js";  

userRouter.post("/register",handleUserRegister)
userRouter.post("/verify-otp",handleOTPVerification)
userRouter.post("/login",handleUserLogin)
userRouter.post("/password-reset-request", handleResetPasswordRequest)
userRouter.post("/verify-password-reset", handleOTPForPasswordReset)

userRouter.post("/upload-file/:file_type", AuthUser, upload.single("file"),handleUserFileUpload )
userRouter.get("/fetch-urser-profile", AuthUser, fetchProfile)



export {userRouter}