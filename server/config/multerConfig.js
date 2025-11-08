import multer from "multer"
import path from "path"
import fs from "fs"

const storage = multer.diskStorage({
    destination: (req, file, cb) => {

        let fileType = req.params.file_type // e.g. 'resume' or 'profile_pictures'

        // Allow only 'resume' or 'profile_pictures' or 'company_logo'

        if (fileType !== "resume" && fileType !== "profile_picture" && fileType !== "logo") {
            return cb(new Error("Invalid upload type."))
        }

        // Define destination based on type

        let uploadPath = path.join
            (
                "upload",
                fileType === "resume"
                ? "resumes"
                : fileType === "profile_picture"
                ? "profile_picture"
                : fileType === "logo"
                ? "company_logos" : "upload"
            )
    

        cb(null, uploadPath)

    },
    filename: (req, file, cb) => {

        let uniqueName = `${Date.now()}-${file.originalname}`
        cb(null, uniqueName)
    }
})

let upload = multer({ storage })

export { upload }