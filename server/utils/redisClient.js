import {createClient} from "redis"
import dotenv from "dotenv"

dotenv.config({path: "./config.env"})

const redisClient =  createClient ({
    url:process.env.REDIS_URL
})

redisClient.on("error", (err) => {
    console.log("redis error : ", err)
})

try {
    await redisClient.connect();
    console.log("SUCCESSFULLY CONNECTED TO THE REDIS CLIENT")
} catch(err){
     console.log("UNABLE TO CONNECT THE REDIS CLIENT : ", err)
}
export {redisClient}