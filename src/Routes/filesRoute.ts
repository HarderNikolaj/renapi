import express from "express";
import middleware from "../Middleware/middleware";
import fs from 'fs';
import { fileStorage, subfolders } from '../settings.json';

const middle = new middleware();
const filesRouter = express.Router();

filesRouter.route('/:project/:filename/:token')
.get(middle.getUserUrlToken,(req:any, res: any)=>{
    const projectPath: string = req.user._id + subfolders.projects + req.params.project + '\\';
    const file: string = req.params.filename;

    res.sendFile(projectPath + file, { root: fileStorage });
});


filesRouter.route('/:project/:filename')
.get(middle.getUser,(req: any, res:any)=>{
    const projectPath: string = req.user._id + subfolders.projects + req.params.project + '\\';
    const file: string = req.params.filename;

    res.sendFile(projectPath + file, { root: fileStorage });

    //return specific file
    //What to do about subfolders?
})
.post(middle.getUser,(req:any, res: any)=>{
    const filePath: string = fileStorage + '\\' + req.user._id + subfolders.projects + req.params.project + '\\' + req.params.filename;
    const data: any = req.body.text;
    fs.writeFile(filePath, data, (error) => {
        (error) ? res.send(error) : res.json({
            "success": true
        });
    });
})
.delete(middle.getUser,(req: any, res: any) => {
    const filePath: string = fileStorage + '\\' + req.user._id + subfolders.projects + req.params.project + '\\' + req.params.filename;
    fs.unlink(filePath, (error) => {
        (error) ? res.send(error) : res.json({
            "sucess": true 
        });
    })
})

filesRouter.route('/:project')
.get(middle.getUser,(req:any,res:any)=>{
    const projectPath: string = fileStorage + '\\' + req.user._id + subfolders.projects + req.params.project + '\\';

    fs.readdir(projectPath, (error, files) => {
        (error) ? res.send(error) : res.send(files);
    })
})
.post(middle.getUser,(req:any,res:any)=>{
    const projectPath: string = fileStorage + '\\' + req.user._id + subfolders.projects + req.params.project;
    
    //først oprettes projectet
    fs.mkdir(projectPath, { 'recursive': true }, (err)=>{
        if(err) res.send(err);
        
        //herefter overføres alle filer fra usertemplate mappen til det nye projekt
        fs.readdir('./userfiletemplates/', (error, files) =>{
            if(error) res.send(error)
            else{
                files.forEach((file)=>{
                    fs.copyFile('./userfiletemplates/' + file, projectPath + '\\' + file, (err)=>{
                        if(err) res.send(err);
                    })
                })     
                res.send({"success": true});
            }
        })
    });
    //Create default files
    //return folder + content?
})
.delete(middle.getUser,(req: any, res: any) => {
    const filePath: string = fileStorage + '\\' + req.user._id + subfolders.projects + req.params.project;
    fs.rmdir(filePath, { recursive: true }, (error) => {
        (error) ? res.send(error) : res.json({
            "sucess": true 
        });
    })
})

// filesRouter.use();
filesRouter.route('')
.get(middle.getUser,(req: any, res: any)=>{
    const userFolder: string = fileStorage + '\\' + req.user._id + subfolders.projects;

    fs.readdir(userFolder, { 'withFileTypes': true }, (error, files) => {
        (error) ? res.send(error) : res.send(files);
    })
    //Return list of users projects
});

export default filesRouter;