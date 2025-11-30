import { format } from 'date-fns';
import { v4 as uuid } from "uuid";
import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";

//define the path to the logs directory
const logEvents = async (message, logFileName) => {
    const dateTime = format(new Date(), "yyyyMMdd\tHH:mm:ss");
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`;
    try{
        if(!fs.existsSync(path.join("../logs"))){
            await fsPromises.mkdir(path.join("../logs"));
        }
        await fsPromises.appendFile(path.join("../logs", logFileName), logItem);
    }catch(err){
        console.log(err);
    }

}

//define the logger middleware
const logger = (req,res ,next) => {
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, "reqLog.log");
    console.log(`${req.method} ${req.path}`);
    next();
}

export { logEvents, logger };