import bcrypt from "bcrypt";
import util from 'util';
import jwt from "jsonwebtoken";
import {secret} from "../settings.json";
import memberModel, { IMemberModel } from "../Models/memberModel";
import employeeModel, { IEmployeeModel } from "../Models/employeeModel";

//laver asynkrone versioner af de bcrypt-metoder vi skal bruge
const promiseGenSalt = util.promisify(bcrypt.genSalt);
const promiseGenHash = util.promisify(bcrypt.hash);

class middleware{

    constructor(){}
    
    public async hash(req: any, res: any, next: () => void){

        //hasher password i body
        if(req.body.password){
            var salt: string = await promiseGenSalt();
            req.body.password = await promiseGenHash(req.body.password, salt);
        }
        next();
    }

    public async authorizePathEmployee(req: any, res: any, next: () => void){
        //denne metode sikrer at brugeren har rettigheder til at tilgå det data der anmodes om
        let token = req.headers.authorization;
        //først fjernes "bearer " fra strengen token
        if(token.startsWith('Bearer ')) token = token.substring(7);
        //token decodes og bliver hermed lavet om til et læsebart objekt        { key: string }
        let decoded: any = jwt.decode(token);
        //der gives  tilladelse hvis brugren forsøger at tilgå egen data
        if(decoded.email == req.params.searchParam) next();

        //der gives  tilladelse hvis brugren hvis brugren har rettighedsniveauet "roleHumanResource"
        else if(decoded.type == "employee"){
            
            employeeModel.findOne({ "email": decoded.email }, (err, document)=>{
                if(document?.roleHumanResource == true) next();
                //ellers afvises anmodningen
                else res.send({'Access': 'Acess denied'});
            });
        }
    }

    public async authorizePathMember(req: any, res: any, next: () => void){
        
        //denne metode sikrer at brugeren har rettigheder til at tilgå det data der anmodes om

        let token = req.headers.authorization;
        //først fjernes "bearer " fra strengen token
        if(token.startsWith('Bearer ')) token = token.substring(7);
        //token decodes og bliver hermed lavet om til et læsebart objekt        { key: string }
        let decoded: any = jwt.decode(token);
        //der gives  tilladelse hvis brugren forsøger at tilgå egen data
        if(decoded.email == req.params.searchParam) next();

        //der gives  tilladelse hvis brugren hvis brugren har rettighedsniveauet "roleSupport"
        else if(decoded.type == "employee"){
            employeeModel.findOne({ "email": decoded.email }, (err, document)=>{
                if(document?.roleSupport == true) next();
                else res.send({'Access': 'Acess denied'});
            });
        }
        else res.send({'Access': 'Acess denied'});
    }

    public async authorizePathFiles(req: any, res: any, next: () => void){
        //Denne metode skal benyttes til at authorisere Employees derforsøger at tilgå en bruges data
        //Det er ikke nødvendigt at authorize members, da dette sker i get user metoden (skal dette laves om?)
        throw new Error("not implemented");
    }

    public authenticate(req: any, res: any, next: () => void){
        
        //validerer at http-requesten indeholder et gyldigt jwt-token
        if(req.headers.authorization){
            var token: string = req.headers.authorization;
            if(token.startsWith('Bearer ')) token = token.substring(7);
            jwt.verify(token, secret, (err)=>{
                //hvis token er gyldigt fortsætter programflowet til næste middlewaremetode, ellers returneres en fejl-besked
                (err) ? res.send(err) : next();
            });
        }
        else{
            res.json({
                "success": false,
                "error": "no token supplied"
            });
        }
    }

public async getUserUrlToken(req: any, res: any, next: () => void){
    //Dette middleware henter data på brugeren tilhørende det angivne jwt-token fra databasen og gemmer det i en req variabel
    //user variabel der overholder IMemberModel interfacet
    var user: IMemberModel = new memberModel();


    //token decodes

    let token = req.params.token;
    if(token?.startsWith('Bearer ')) token = token.substring(7);
    let decoded: any = jwt.decode(token);

    //brugeren tilhørende det angivne token findes frem fra database og gemmes i req.user. 
    //Og kan hermed tilgås fra efterfølgende Expres (req,res) functioner
    await memberModel.findOne( {"email": decoded.email}, (err, document)=>{
        if(err) res.send(err);
        else{
            if (document) user = document;
        }
    });
    req.user = user;
    next();
}

    public async getUser(req: any, res: any, next: () => void){

        //Dette middleware henter data på brugeren tilhørende det angivne jwt-token fra databasen og gemmer det i en req variabel
        var user: IMemberModel = new memberModel();

        //token decodes

        let token = req.headers.authorization;
        if(token?.startsWith('Bearer ')) token = token.substring(7);
        let decoded: any = jwt.decode(token);
        //brugeren tilhørende det angivne token findes frem fra database og gemmes i req.user. 
        //Og kan hermed tilgås fra efterfølgende Expres (req,res) functioner
        await memberModel.findOne( {"email": decoded.email}, (err, document)=>{
            if(err) res.send(err);
            else{
                if (document) user = document;
            }
        });
        req.user = user;
        next();
    }

}
export default middleware;