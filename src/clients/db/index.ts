import {PrismaClient} from  "@prisma/client";


//exporting the prisma client 
export const prismaClient=new PrismaClient({log:["query"]});//create the prisma client