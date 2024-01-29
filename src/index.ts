import { initServer } from "./app";


//we are starting the Express Server along with that the internal  graphql server Here at /graphql route
async function init(){

    const app=await initServer();

    app.listen(8000,()=>{
        console.log("Server started at port 8000")
    })
}

init();
