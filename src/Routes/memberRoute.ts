import express from "express";
import memberModel, { IMemberModel } from "../Models/memberModel";
import middleware from "../Middleware/middleware";
import { FilterQuery } from "mongoose";
import { fileStorage } from '../settings.json';
import fs from 'fs';
import multer from 'multer';


const upload = multer({dest:fileStorage+'/temp'});
const middle = new middleware();
const membersRouter = express.Router();

membersRouter.route('/profilepic/:token')
.get(middle.getUserUrlToken,(req: any, res: any) => {
    const folderPath: string = req.user._id + '\\images\\';
    
    res.sendFile(folderPath + 'profilePic.png', { root: fileStorage });
});

membersRouter.route('/profilepic')
.post(middle.getUser, upload.any(),(req: any, res: any) => {

    const folderPath: string = 'files\\' +  req.user._id + '\\images\\';

    fs.copyFile(req.files[0].path, folderPath + 'profilePic.png', (err)=>{
        fs.unlink(req.files[0].path, (err)=>{ 
            (err) ? res.send(err) : res.send('success');
        });
    })
})

//rute for //host/members/
membersRouter.route('')
//henter alle members fra databasen og sender dem retur
//forudsat at middle.authenticate går godt
.get(middle.authenticate,(req,res) => {
    memberModel.find(async (err, documents) => {
        (err) ? res.send(err) : res.send(documents);
    });
})
//forsøger at oprette en bruger i databasen og sender den retur hvis det går godt
.post(async (req, res) =>{
    var user: IMemberModel = new memberModel(req.body);
   
    user.save((err, product) => {
        if(err){
            res.send(err);
        }
        else{
            const userPath: string = fileStorage + '\\' + product._id;
            
            //først oprettes projectet
            fs.mkdir(userPath, { 'recursive': true }, (err)=>{
                if(err) res.send(err);
                
                //herefter overføres alle filer fra usertemplate mappen til det nye projekt
                fs.readdir('./usertemplate/', (error, files) =>{
                    if(error) res.send(error)
                    else{
                        
                        files.forEach((file)=>{
                            fs.copyFile('./usertemplate/' + file, userPath + '\\' + file, (err)=>{
                                if(err) res.send(err);
                            })
                        })     
                    }
                })
            });
        }
    })
})
//sletter alle brugere i databasen og sender en besked return hvis det er gået godt.
//forudsat at middle.authenticate går godt
//FJERN DENNE METODE FRA FÆRDIGT PRODUKT
.delete(middle.authenticate,(req, res) => {
    memberModel.deleteMany({}, (err) => {
        (err) ? res.send(err) : res.json({ 'success': true }) 
    });
});

//middleware der forhindrer uautorizerede i at benytte nedenstående ruter. 
membersRouter.use(middle.getUser, middle.authenticate);
//rute for //host/members/:parameter
membersRouter.route('/:searchParam')
//henter brugere frem der passer til en given søgestreng
.get(middle.authorizePathMember, (req,res) => {
    //et array der skal indeholde en serie objekter af typen filterquery
    let searchObjectArray : FilterQuery<Pick<IMemberModel, "email" | "firstname" | "lastname">>[] = [];
    //der laves et array indeholdende hvert af de ', ' sepererede søgeparameter
    let SearchParams : string[] = req.params.searchParam.split(", ");
    
    //for hvert søgeparameter laves der et filterquery object, der søger efter søgeparamentret i kolonnerne emial, firstname og lastname
    SearchParams.forEach((value, index) => {
        //søgeparametret laves om til en regular expression, da disse fungerer som wildcards når man benytter dem i mongoose
        const reg: RegExp = new RegExp(value);
        searchObjectArray[index] = { $or: [{ 'email': reg }, { 'firstname': reg }, { 'lastname': reg }]};
    });
    //der foretages en søgning på hver filter-query og returner de employees der matcher alle sammen 
    memberModel.findOne({ $and: searchObjectArray }, (err, documents) => {
        if(err ) res.send(err);
        else{
            //Da password er required på objecter af typen IMember, converteres documents til et generisk object
            //hvorefter password slettes og resten af dokumentet videresendes
            let doc = documents?.toObject()
            delete doc.password
            res.send(doc)
        }
    });
})
//sletter en bruger baseret på mail
.delete(middle.authorizePathMember, (req, res) => {
    memberModel.deleteOne({'email': req.params.searchParam}, (err) => {
       (err) ? res.send(err) : res.json({'success': true}); 
    });
})
//finder en bruger på email og ændrer de kolonner der fremgår af req.body
.patch(middle.authorizePathMember, (req, res) => {
    memberModel.updateOne({ "email": req.params.searchParam}, req.body, (err, result)=>{
        (err) ? res.send(err) : res.send(result);
    });
})

export default  membersRouter;