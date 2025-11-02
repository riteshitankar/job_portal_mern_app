import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config({ path: "./config.env" })

const AuthUser = async (req, res, next) => {
    try {

        let userToken = req.headers.Authorization

        if (!userToken) throw ("token not found/invalid token !")

        // verify

        let result = jwt.verify(userToken, process.env.JWT_SECRET_KEY)

        let user = await userModel.findOne({ "email.userEmail": result.email })

        if (!user) throw ("user not found !")

        if (!user.email.verified) throw ('email not verified please verify the email first to perform this action !')

        req.user = user

        next()

    } catch (err) {
        console.log("auth failed with an error : ", err)
        res.status(401).json({ message: "auth user failed please login !" })
    }
}

export { AuthUser }