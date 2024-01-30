import { Tweet } from "@prisma/client";
import { prismaClient } from "../../clients/db";
import { GraphqlContext } from "../../interfaces";


interface CreateTweetPayload{
    content:string;
    imageURL?:string;
}


//to get all the queries
const queries={
    getAllTweets:async()=>{
        const allTweets=await prismaClient.tweet.findMany({orderBy:{createdAt:"desc"}})
        return allTweets;
    }
}

  
//all the mutations for the tweet
const mutations={
    createTweet:async(parent:any,{payload}:{payload:CreateTweetPayload},ctx:GraphqlContext)=>{

        //cehck if the current user is logged in or not
        if(!ctx.user) throw new Error("You are not Authenticated! try logging in");

        const tweet=await prismaClient.tweet.create({
                 data:{
                    content:payload.content,
                    imageURL:payload.imageURL,
                    author:{connect:{id:ctx.user.id}}//from context give the id for the relation
                }
        });

        return tweet;
        
    }
}


//this contains the object key "Tweet" as well
const extraResolvers={
    Tweet:{
        author:async(parent:Tweet)=>{
            const author=await prismaClient.user.findUnique({where:{id:parent.authorId}});
            return author;
        }
    }
}

export const resolvers = {mutations,extraResolvers,queries};