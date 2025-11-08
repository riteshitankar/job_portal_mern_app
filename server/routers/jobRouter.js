import express from "express"

import { createJob, getJobData, handleJobAction, handleJobApplication,handleJobUpdate} from "../controllers/jobController.js"
import { AuthUser } from "../middlewares/AuthUser.js"
import { AuthCompany} from "../middlewares/AuthCompany.js"

const jobRouter = express.Router()

jobRouter.post("/add-job", AuthCompany, createJob)

jobRouter.post("/job-update/:jobId",AuthCompany,handleJobUpdate)

jobRouter.post("/job-action/:action/:jobId", AuthCompany,handleJobAction)
// action:1)delete 2)closed

jobRouter.post("/apply-for-job/:jobId", AuthUser, handleJobApplication)

jobRouter.get("/get-jobs", getJobData)

export { jobRouter }