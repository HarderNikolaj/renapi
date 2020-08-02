//for kommentarer, se employeemodel
import mongoose, { Schema, Document} from "mongoose";
import { database } from "../settings.json";

const dbPath: string = database + '/members';
//der oprettes forbindelse til databasen
console.log(dbPath);
mongoose.connect(dbPath, { useNewUrlParser: true, useFindAndModify: true, useUnifiedTopology: true, useCreateIndex: true })
.catch(()=>console.log("Could not connect to database - " + dbPath));

//der laves en model til employee
//da MongoDB er en ikke-relation database er det ikke muligt at definere ens tabeller på databasesiden
//det gøres i stedet i API'en, med et datascheema (jeg bruger mongoose)
export const memberSchema = new Schema({
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
    }
});

//et interface der beskriver member
//det skal bruges til TypeScripts strong typing (i.e at intelisense kan genkende det)
interface IMember{
    email : string;
    firstname : string;
    lastname : string;
    password : string;
}
//interface exporteres så det kan importeres i andre moduler
//Document indeholder metoder til database-kontakt (find, delete, modify osv)
export interface IMemberModel extends Document, IMember{

}

//EmployeeModel exporteres og kan herefter kan andre moduler bruge den til at skrive til employee-collectionen databasen
var MemberModel = mongoose.model<IMemberModel>('Member',memberSchema);
export default MemberModel;