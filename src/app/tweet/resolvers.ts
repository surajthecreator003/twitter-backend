import { Tweet } from "@prisma/client";
import { prismaClient } from "../../clients/db";
import { GraphqlContext } from "../../interfaces";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import UserService from "../../services/user";
import TweetService, { CreateTweetPayload } from "../../services/tweet";

//S3Client is the client for the S3 bucket and putObjectCommand is the command to put the object in the S3 bucket

const s3Client = new S3Client({
  region: process.env.AWS_DEFAULT_REGION,
  credentials: {
    accessKeyId: "AKIAYQB2MC65NU6QEPEI",
    secretAccessKey: "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",
  },
});

//to get all the queries
const queries = {
  getAllTweets: async () => {
    const allTweets = await TweetService.getAllTweets();
    return allTweets;
  },

  //this will just sign the url of the S3 bucket and return it
  getSignedURLForTweet: async (
    parent: any,
    { imageType, imageName }: { imageType: string; imageName: string },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user || !ctx.user.id) {
      throw new Error("You are not Authenticated! try logging in");
    }

    const allowedImageTypes = [
      "image/png",
      "image/jpeg",
      "image/jpg",
      "image/webp",
    ]; //allow gifs types
    //ideas for future if you want to send gifs in chats

    //checkingthe image type
    if (!allowedImageTypes.includes(imageType))
      throw new Error("Image type not allowed");

    const putObjectCommand = new PutObjectCommand({
      //we are first creating the folder needed to store the images
      Bucket: process.env.AWS__S3__BUCKET,
      Key: `uploads/${
        ctx.user.id
      }/tweets/${imageName}-${Date.now()}.${imageType}`, ///${imageName}-${Date.now()}.${imageType} will help not overide if there are any previous pics of smae id
    }); //Key will hold the image path dynamicaly in the S3 bucket
    console.log("putObjectCommand =", putObjectCommand);

    //signedURL will encode the whole s3client and putObjectCommand and return the signedURL
    const signedURL = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 3600,
    }); //expires in 1 hour
    console.log("signedURL =", signedURL);
    //will attach the image to the body of this signedURL for uploading it to the S3 bucket

    return signedURL;
  },
};

//all the mutations for the tweet
const mutations = {
  createTweet: async (
    parent: any,
    { payload }: { payload: CreateTweetPayload },
    ctx: GraphqlContext
  ) => {
    //cehck if the current user is logged in or not
    if (!ctx.user) throw new Error("You are not Authenticated! try logging in");

    const tweet = await TweetService.createTweet({
      ...payload,
      userId: ctx.user.id,
    });

    return tweet;
  },
};

//this contains the object key "Tweet" as well
const extraResolvers = {
  Tweet: {
    author: async (parent: Tweet) => {
      const author = await UserService.getUserById(parent.authorId);
      return author;
    },
  },
};

export const resolvers = { mutations, extraResolvers, queries };
