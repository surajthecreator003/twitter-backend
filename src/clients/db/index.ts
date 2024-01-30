import {PrismaClient} from  "@prisma/client";


//create and export the prisma client 
export const prismaClient=new PrismaClient({log:["query"]});//create the prisma client
//this log:query will log all the PostgresSQL queries when getting executed