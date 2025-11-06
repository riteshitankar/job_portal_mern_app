import mongoose from "mongoose";
import bcrypt from "bcrypt";

let addressSchema = {
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    country: { type: String, default: "" },
    pincode: { type: String, default: "" },
}

let emailSchema = {
    companyEmail: { type: String, required: true },
    verified: { type: Boolean, default: false },
}

let contactPersonSchema = {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    position: { type: String, required: true }
}

let companyDetailsSchema = {
    name: { type: String, required: true },
    est_year: { type: String, required: true },
    address: { type: Object, default: addressSchema },
    bio: { type: String, required: true },
    website: { type: String, required: false },
    industryType: { type: String, required: true },
    founders: { type: Array },
    hrEmail: { type: String, required: true }
}

const companySchema = new mongoose.Schema({
    companyDetails: {
        type: Object,
        required: true,
        default: companyDetailsSchema
    },
    contactPerson: {
        type: Object,
        required: true,
        default: contactPersonSchema
    },
    email: {
        type: Object,
        required: true,
        // default: emailObject
        default: emailSchema

    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    companyLogo: {
        type: String,
        required: false
    },
    documents: {
        type: Array,
        default: []
    },
    createJobs: {
        type: Array,
        default: []
    }
});

// Password hashing middleware
companySchema.pre("save", async function (next) {
    try {
        if (!this.isModified("password")) return next();
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (err) {
        next(err);
    }
});


let companyModel = new mongoose.model("companies", companySchema);

export { companyModel };