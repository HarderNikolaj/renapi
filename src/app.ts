import express from "express";
import membersRouter from "./Routes/memberRoute";
import employeesRouter from "./Routes/employeeRoute";
import filesRouter from './Routes/filesRoute';
import loginRouter from "./Routes/loginRoute";
import bodyParser from "body-parser";
import middleware from './Middleware/middleware'
import cors from 'cors'; //Cross origin resource sharing

const middle = new middleware();



const app = express();
app.use(bodyParser.json());

app.use(cors());
app.use('/login/', loginRouter);

app.use(express.static( './files'));
app.use(cors(), middle.hash);
app.use('/employees/', employeesRouter);
app.use('/members/files/', filesRouter);
app.use('/members/', membersRouter);



const Port = process.env.Port || 3000;

app.listen(Port, ()=> {
    console.log('server is running on port: ' + Port);
    var today = new Date();
    console.log('server started at: ' + today.toTimeString());
});