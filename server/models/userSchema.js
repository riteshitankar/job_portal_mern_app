// import {verify} from "jsonwebtoken"
import mongoose from "mongoose"
import bcrypt from "bcrypt"

let addressObject = {
    street: "", city: "", state: "", country: "", pincode: ""
}

let emailObject = {
    userEmail: "", verify : false
}

let userSchema = mongoose.Schema({
    name:{
        type:String,
        require:true
    },
    email:{
        type: Object,
        require:true,
        default: emailObject
    },
    password: {
        type: String,
        require: true
    },
    phone: {
        type: String,
        require: true
    },
     address: {
        type: Object,
        require: true,
        default: addressObject
    },
    dob: {
        type: String,
        require: true
    },
    qualifications: {
        type: Array,
        default: []
    },
    documents: {
        type: Array,
        default: []
    },
    appliedJobs: {
        type: Array,
        default: []
    },
    timeStamp: {
        type: Date,
        default: Date.now()
    }
})

userSchema.pre("save", async function () {
    try{
        console.log("user password is :", this.password)
        this.password = await bcrypt.hash(this.password, 10)
        console.log("password hased and saved !")

    } catch (err){
         console.log("error in pre method : ", err)
         throw err
    }
})


let userModel = new mongoose.model("users",userSchema)

export {userModel}