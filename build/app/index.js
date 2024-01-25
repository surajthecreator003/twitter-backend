"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initServer = void 0;
const server_1 = require("@apollo/server");
const express_1 = __importDefault(require("express"));
const express4_1 = require("@apollo/server/express4");
const body_parser_1 = __importDefault(require("body-parser"));
//the graphql server and the normal express server
function initServer() {
    return __awaiter(this, void 0, void 0, function* () {
        const app = (0, express_1.default)(); //create the express server
        app.use(body_parser_1.default.json()); //json to normal js 
        //directly use the prisma client
        //prismaClient.user.findMany().then((users)=>{
        //creating the graphql Server
        //typeDefs is like the Schema resolvers contains the Query and Mutation
        //Query is for fetching some data from server
        //while resolvers is for changing data on server 
        const graphqlServer = new server_1.ApolloServer({
            typeDefs: `
           type Query{
                sayHello:String
           },
          
        `,
            resolvers: {
                Query: {
                    sayHello: () => `Hello From GraphQl Server`
                },
            }
        });
        yield graphqlServer.start(); //start the graphql server
        app.use("/graphql", (0, express4_1.expressMiddleware)(graphqlServer)); //pass on the graphql server to express server
        return app;
    });
}
exports.initServer = initServer;
;
