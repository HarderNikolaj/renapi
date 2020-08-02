import express from "express";
import employeeModel, { IEmployeeModel } from "../Models/employeeModel";
import middleware from "../Middleware/middleware";
import { FilterQuery } from "mongoose";

const middle = new middleware();
const employeesRouter = express.Router();

//rute for //host/employees/
employeesRouter.route('')
//henter alle employees fra databasen og sender dem retur
//forudsat at middle.authenticate går godt
.get(middle.authenticate,(req,res) => {
    employeeModel.find(async (err, documents) => {
        (err) ? res.send(err) : res.send(documents);
    });
})
//forsøger at oprette en bruger i databasen og sender den retur hvis det går godt
.post(async (req, res) =>{
    var user: IEmployeeModel = new employeeModel(req.body);
    user.save((err, product) => {
        (err) ? res.send(err) : res.send(product);
    });
})
//sletter alle brugere i databasen og sender en besked return hvis det er gået godt.
//forudsat at middle.authenticate går godt
//FJERN DENNE METODE FRA FÆRDIGT PRODUKT
.delete(middle.authenticate,(req, res) => {
    employeeModel.deleteMany({}, (err) => {
        (err) ? res.send(err) : res.json({ 'success': true }) 
    });
});

//middleware der forhindrer uautorizerede i at benytte nedenstående ruter. 
employeesRouter.use(middle.authenticate, middle.authorizePathEmployee)
//rute for //host/employees/:parameter
employeesRouter.route('/:searchParam')
//henter brugere frem der passer til en given søgestreng
.get((req,res) => {
    //et array der skal indeholde en serie objekter af typen filterquery
    let searchObjectArray: FilterQuery<Pick<IEmployeeModel, "email" | "firstname" | "lastname">>[] = [];
    //der laves et array indeholdende hvert af de ', ' sepererede søgeparameter
    let SearchParams : string[] = req.params.searchParam.split(", ");
    
    //for hvert søgeparameter laves der et filterquery object, der søger efter søgeparamentret i kolonnerne emial, firstname og lastname
    SearchParams.forEach((value, index) => {
        //søgeparametret laves om til en regular expression, da disse fungerer som wildcards når man benytter dem i mongoose
        const reg: RegExp = new RegExp(value);
        searchObjectArray[index] = { $or: [{ 'email': reg }, { 'firstname': reg }, { 'lastname': reg }]};
    });
    //der foretages en søgning på hver filter-query og returner de employees der matcher alle sammen 
    employeeModel.find({ $and: searchObjectArray }, (err, documents) => {
        (err) ? res.send(err) : res.send(documents);
    });
})
//sletter en bruger baseret på mail
.delete((req, res) => {
    employeeModel.deleteOne({'email': req.params.searchParam}, (err) => {
       (err) ? res.send(err) : res.json({'success': true}); 
    });
})
//finder en bruger på email og ændrer de kolonner der fremgår af req.body
.patch((req, res) => {
    employeeModel.updateOne({ "email": req.params.searchParam}, req.body, (err, result)=>{
        (err) ? res.send(err) : res.send(result);
    });
})

export default  employeesRouter;