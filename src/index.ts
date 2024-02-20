import { initServer } from "./app";
import * as dotenv from "dotenv";

dotenv.config();
console.log("env vars loaded =", process.env); //checking if env var loading works

//we are starting the Express Server along with that the internal  graphql server Here at /graphql route
async function init() {
  const app = await initServer();

  app.listen(8000, () => {
    console.log("Server started at port 8000");
  });
}

init();
