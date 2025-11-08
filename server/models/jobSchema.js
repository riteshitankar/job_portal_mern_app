import mongoose from "mongoose"

let jobRequirementsObject = {
    type: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    exprience: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    postData: {
        type: Date,
        default: Date.now(),
        required: true
    },
    offeredSalary: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    }
}

const jobSchema = mongoose.Schema({
    title: {
        type: String,
        requried: true
    },
    jobCreatedBy: {
        type: String,
        requried:true
    },
    jobRequirements:{
        type:Object,
        default:jobRequirementsObject
    },
    applications:{
        type:Array,
        default:[],
        requried:false
    },
    closed: {
        type: Boolean,
        default: false
    },
    maxApplications: {
        type: Number,
        default: 0
    },
    timeStamp: {
        type: Date,
        default: Date.now()
    }
})

const jobModel = mongoose.model("jobs",jobSchema)

export default jobModel