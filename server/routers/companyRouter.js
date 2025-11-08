import express from  "express"

import {handleCompanyRegister, handleOTPVerification,handleCompanyLogin,handleResetPasswordRequest,handleOTPForPasswordReset,handleResetPasswordRequestOldToNew} from "../controllers/companyController.js"

import {handleCompanyFileUpload} from "../controllers/companyController.js"

import AuthCompany from "../middleware/AuthCompany.js"

import { upload } from "../config/multerConfig.js"

let companyRouter = express.Router()

// companyRouter.get("/test",test)

companyRouter.post("/register",handleCompanyRegister)

companyRouter.post("/verify-otp",handleOTPVerification)

companyRouter.post("/company-login", handleCompanyLogin)

companyRouter.post("/password-reset-request",handleResetPasswordRequest)

companyRouter.post("/verify-reset-password-request",handleOTPForPasswordReset)

companyRouter.patch("/old-password-newPassword",handleResetPasswordRequestOldToNew)

// to upload resume/profie/docs we need to verfiy the user

companyRouter.post("/upload-file/:file_type", AuthCompany,upload.single("file"),handleCompanyFileUpload)


export {companyRouter}