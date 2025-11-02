// import packages
import express, {Router} from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import './database/conn.js'

// import routers
import {userRouter} from './routers/userRouter.js'

dotenv.config({path: "./config.env"})

let app = express()
let port = process.env.PORT || 5012

app.use(express.static('public'));
app.use(express.json())
app.use(express.urlencoded({extended:true}))

let corsOptions = {
    origin : '*',
    method : '*'
}

app.use(cors(corsOptions))
app.get('/', (req, res) => {
  res.status(200).send('Hello from Express server!');
});
app.use("/user",userRouter)

app.use((req,res) => {
    console.log('user trying to access invalid route!')
    res.status(404).json({ message: "content/route not found !"})

})

app.listen(port, () => {
    console.log(`server is running on port ${port} !`)
})



















// import express from 'express';

// const app = express();
// const PORT = 5000;

// // Middleware to parse JSON
// app.use(express.json());

// // Basic route
// app.get('/', (req, res) => {
//   res.send('Hello from Express server!');
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });