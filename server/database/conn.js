import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config({path: "./config.env"})

async function conn() {
    try{
        await mongoose.connect(process.env.MONGODB_CONNECTION_STRING)

        console.log("Connection with database was sucessfull !")

    } catch (err) {

        console.log("unable to conncet with database : ", err)

    }
}
conn()
