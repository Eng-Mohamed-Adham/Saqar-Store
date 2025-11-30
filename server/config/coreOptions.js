import { optionsSuccessStatus } from "../../../../back_computer_company-master/back_computer_company-master/config/corsOptions";
import allowsOrigin from "./allowsOrigins";

const coreOptions = {
    origin: (origin,callback) => {
        if(allowsOrigin.indexOf(origin)!== -1 || !origin ){
            callback(null, true)
        }else{
            callback(new Error('Not allowed by CORS'))
        }

    },
    credentials: true,
    optionsSuccessStatus:200
}
export default coreOptions