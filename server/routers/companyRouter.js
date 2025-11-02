import express from "express"
import {companyRegister, companyOTPVerification, companyLogin, companyResetPasswordRequest, companyOTPForPasswordReset} from '../controllers/companyController.js'


let companyRouter = express.Router()


companyRouter.post("/companyRegister",companyRegister)
companyRouter.post("/companyOTPVerification",companyOTPVerification)
companyRouter.post("/companyLogin",companyLogin)
companyRouter.post("/companyResetPasswordRequest",companyResetPasswordRequest)
companyRouter.post("/companyOTPForPasswordReset",companyOTPForPasswordReset)

export {companyRouter}