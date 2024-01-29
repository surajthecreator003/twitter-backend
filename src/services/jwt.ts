import { User } from "@prisma/client";
//import { prismaClient } from "../clients/db";
import JWT from "jsonwebtoken";

import {JWTUser} from "../interfaces";

//have to put this in .env file
const JWT_SECRET="mysecret";

class JWTService{


    //for creating JWT Token from the Googkle OAuth Token and sending it back to the client
    public static generateTokenForUser(user:User){
        //const user=await prismaClient.user.findUnique({where:{id:userId}});

        //we will send the required data of the lpgged in user to the client again signing with the jwt token
        const payload:JWTUser={
            id:user?.id,
            email:user?.email,
            firstName:user?.firstName,
            lastName:user?.lastName,

        };

        const token=JWT.sign(payload,JWT_SECRET);
        return token ;
    }


    //For Decoding our own JWT Token
    public static decodeToken(token:string){

        //this was causing the whole error after adding React-Query
        //and after deleteing token manually
        try{
            return JWT.verify(token,JWT_SECRET) as JWTUser;
        }catch(error){
            return null
        }
        
    }//this was casuinig the error as react-query was hitting the graphql servere getCurrentUSer and for it to work 
    //there must be a JWT token in the local storage but as we are not sending the token from the client side initially 
    //it was casuing error but now  as it will return null there will be no issue for react-query and it will give null
    //initially but after logging in it will give the token and then it will work fine
}
//initially it was running fine because we had the __twitter__token in our localStorage so it was taking it and fetching data
//after deleteing it it was causing error as it was not able to decode the token and was giving error



export default JWTService;