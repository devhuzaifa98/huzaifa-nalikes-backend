import * as dotenv from 'dotenv';
import path from "path";
dotenv.config({ path: path.resolve(process.cwd(), "./.env") });
console.log('Loading dotenv file...');
export default true;