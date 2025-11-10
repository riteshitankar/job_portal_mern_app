import express from "express"

import { createJob, getJobData, handleJobAction, handleJobApplication,handleJobUpdate} from "../controllers/jobController.js"
import  AuthUser  from "../middleware/AuthUser.js"
import  AuthCompany from "../middleware/AuthCompany.js"

const jobRouter = express.Router()

jobRouter.post("/createjob", AuthCompany, createJob)

jobRouter.post("/jobupdate/:jobId",AuthCompany,handleJobUpdate)

jobRouter.post("/jobaction/:action/:jobId", AuthCompany,handleJobAction)

jobRouter.post("/jobapply/:jobId", AuthUser, handleJobApplication)

jobRouter.get("/getjob", getJobData)

export { jobRouter }