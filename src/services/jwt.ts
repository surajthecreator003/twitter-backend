import { User } from "@prisma/client";
import { prismaClient } from "../clients/db";
import JWT from "jsonwebtoken";

const JWT_SECRET="mysecret";

class JWTService{
    public static generateTokenForUser(user:User){
        //const user=await prismaClient.user.findUnique({where:{id:userId}});

        
        //we will send the required data to the client signing with the jwt token
        const payload={
            id:user?.id,
            email:user?.email,

        };

        const token=JWT.sign(payload,JWT_SECRET);
        return token;
    }
}

export default JWTService;