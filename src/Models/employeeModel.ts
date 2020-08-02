import mongoose, { Schema, Document} from "mongoose";
import { database } from "../settings.json";

const dbPath: string = database + '/employees';
//der oprettes forbindelse til databasen
mongoose.connect(dbPath, { useNewUrlParser: true, useFindAndModify: true, useUnifiedTopology: true, useCreateIndex: true })
.catch(()=>console.log("Could not connect to database - " + dbPath));

//der laves en model til employee
//da MongoDB er en ikke-relation database er det ikke muligt at definere ens tabeller på databasesiden
//det gøres i stedet i API'en, med et datascheema (jeg bruger mongoose)
export const employeeSchema = new Schema({
    email: 
    {
        type: "string",
        required: true,
        unique: true
    },
    firstname:
    {
        type: "string",
        required: true
    },
    lastname:
    {
        type: "string",
        required: true
    },
    password:
    {
        type: "string",
        required: true
    },
    jobtitle:
    {
        type: "string",
        required: false
    },
    roleHumanResource:
    {
        type: "boolean",
        required: true,
        default: false
    },
    roleSupport:
    {
        type: "boolean",
        required: true,
        default: false
    },
    roleAdministrator:
    {
        type: "boolean",
        required: true,
        default: false
    },
});

//et interface der beskriver employee
//det skal bruges til TypeScripts strong typing (i.e at intelisense kan genkende det)
interface IEmployee{
    email : string;
    firstname : string;
    lastname : string;
    password : string;
    jobtitle : string;
    roleHumanResource : boolean;
    roleSupport : boolean;
    roleAdministrator : boolean;
}

//interface exporteres så det kan importeres i andre moduler
//Document indeholder metoder til database-kontakt (find, delete, modify osv)
export interface IEmployeeModel extends Document, IEmployee{

}

//EmployeeModel exporteres og kan herefter kan andre moduler bruge den til at skrive til employee-collectionen databasen
var EmployeeModel = mongoose.model<IEmployeeModel>('Employee',employeeSchema);
export default EmployeeModel;