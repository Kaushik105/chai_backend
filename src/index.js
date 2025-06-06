import connectDB from "./db/index.js";
import dotenv from "dotenv";
import {app} from "./app.js"


dotenv.config({
	path: "./.env",
});

connectDB()
.then(() => { 
	app.on("error", (error) => {
		console.error("ERROR: ", error);
		throw error;
	})
	app.listen(process.env.PORT || 8000, () => { 
		console.log(`Server is listening at port: ${process.env.PORT}`);
	 })
 })
.catch((err) => { 
	console.log("mongodb connection failed !!! \n server crashed ", err);
 })





// const app = express();
// (async () => {
// 	try {
// 		await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
// 		app.on("error", (error) => {
// 			console.error("ERROR: ", error);
// 			throw error;
// 		});
// 		app.listen(process.env.PORT, () => {
// 			console.log(`Server is running at port ${process.env.PORT}`);
// 		});
// 	} catch (error) {
// 		console.error("ERROR: ", error);
// 		throw error;
// 	}
// })();
