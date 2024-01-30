import { ApolloServer } from "@apollo/server";
import express from "express";
import {expressMiddleware} from "@apollo/server/express4";
import bodyParser from "body-parser";

import cors from "cors";

import { User } from "./user";
import { Tweet } from "./tweet";

import { GraphqlContext } from "../interfaces";
import JWTService from "../services/jwt";

//the graphql server and the normal express server
export async function initServer(){
    const app=express();//create the express server

   app.use(cors())
   app.use(bodyParser.json());//json to normal js 
   

   //directly use the prisma client
   //prismaClient.user.findMany().then((users)=>{

    //Graphql Server
    //typeDefs is like the Schema resolvers contains the Query and Mutation
    //Query is for fetching some data from server
    //while resolvers is for changing data on server 
    const graphqlServer= new ApolloServer<GraphqlContext>(
        {
        typeDefs:`

          ${User.types}
          ${Tweet.types}

           type Query{
                ${User.queries}
                ${Tweet.queries}
                
           },
           
           type Mutation{             
               ${Tweet.mutations}
           }
        `,
        resolvers:{
                   Query:{
                        ...User.resolvers.queries,
                        ...Tweet.resolvers.queries
                   },
                   Mutation:{
                         ...Tweet.resolvers.mutations
                   },

                   ...Tweet.resolvers.extraResolvers,

                   ...User.resolvers.extraResolvers
                   
                  },
         
    }
    )



    await graphqlServer.start();//start the graphql server

    //context in graphql is like the metadata for the whole graphql server that gets passed on from the express server to the Graphql Server
    //currently providing the jwt token as context to the graphql server
    app.use("/graphql",expressMiddleware(graphqlServer,{context:async({req,res})=>{


            return {//will return the user details decoding from the jwt token
               user:req.headers.authorization?JWTService.decodeToken(req.headers.authorization.split("Bearer ")[1])
               :
               undefined
            }
    }}))//pass on the graphql server to express server

    return app;

    };

