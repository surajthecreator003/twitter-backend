import { ApolloServer } from "@apollo/server";
import express from "express";
import {expressMiddleware} from "@apollo/server/express4";
import bodyParser from "body-parser";
import { prismaClient } from "../clients/db";

import { User } from "./user";

//the graphql server and the normal express server
export async function initServer(){
    const app=express();//create the express server


   app.use(bodyParser.json());//json to normal js 


   //directly use the prisma client
   //prismaClient.user.findMany().then((users)=>{

    //creating the graphql Server
    //typeDefs is like the Schema resolvers contains the Query and Mutation
    //Query is for fetching some data from server
    //while resolvers is for changing data on server 
    const graphqlServer= new ApolloServer<any>(
        {
        typeDefs:`

          ${User.types}

           type Query{
                ${User.queries}
           },
          
        `,
        resolvers:{
                   Query:{
                        ...User.resolvers.queries
                   },
                   
                  }
    }
    )



    await graphqlServer.start();//start the graphql server

    app.use("/graphql",expressMiddleware(graphqlServer))//pass on the graphql server to express server

    return app;

    };

