import { IMemberModel } from "../../Models/memberModel";
import { IEmployeeModel } from "../../Models/employeeModel";

declare namespace Express{
    interface Request{
        user?: IMemberModel,
        employee?: IEmployeeModel
    }
}



