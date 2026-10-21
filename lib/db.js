import { MongoClient } from "mongodb";
const g = globalThis;
export default (g._mongo ??= new MongoClient(process.env.MONGODB_URI).connect());
