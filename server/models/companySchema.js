import mongoose from "mongoose";
import bcrypt from "bcrypt";

let addressObject = {
    city:"",
    state :"",
    country :"",
    pincode :""
}

let emailObject = {
    companyEmail : "",
    verify :false
}
let jobsObject ={
    Post:"",
    vaccancies: ""
}

let companySchema = mongoose.Schema({
    companyName: {
        type: String,
        required: true
    },
    email : {
        type:Object,
        required: true,
        default: emailObject
    },
    password: {
        type: String,
        required: true
    },
    contactEmailOrPhone: {
        type: String,
        required: true
    },
    address: {
        type: Object,
        required: true,
        default: addressObject
    },
    website: {
        type: String,
        default: true
    },
    industryType: {
        type: String,
        required: true
    },
    // number of employees working in company
    companySize: { 
        type: String,
        default: true
    },
    description : {
        type: String,
        default : true
    },
    postedJobs : {
        type: Object,
        required: true,
        default : jobsObject
    },
    timeStamp: {
        type: Date,
        default: Date.now()
    }


});

companySchema.pre("save", async function () {
    try {
        if (this.isModified("password")) {
            console.log("Company password is:", this.password);
            this.password = await bcrypt.hash(this.password, 10);
            console.log("Password hashed and saved!");
        }
    } catch (err) {
        console.log("Error in pre method:", err);
        throw err;
    }
});

let companyModel = new mongoose.model("companies", companySchema);

export { companyModel };