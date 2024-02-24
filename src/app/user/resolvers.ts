// import axios from "axios";
// import { User } from ".";
import { User } from "@prisma/client";
import { prismaClient } from "../../clients/db";
// import JWTService from "../../services/jwt";
import { GraphqlContext } from "../../interfaces";
import UserService from "../../services/user";

//queries is a big Object with query name as keys and the callback function/resolver as the value
const queries = {
  //verifyGoogletoken Query will take google OAuth token and verify it and then return our own jwt token with only email and id as the payload
  verifyGoogleToken: async (parent: any, { token }: { token: string }) => {
    const resultToken = await UserService.verifyGoogleAuthToken(token);
    return resultToken;
  },

  //getCurrentUser Returns the current user details and will also create the user if not present in the database
  //this assumes we have already decoded the JWT token and provided it in the Context of the Graphql Server
  getCurrentUser: async (parent: any, args: any, ctx: GraphqlContext) => {
    console.log("ctx or GraphQl Context =", ctx);
    console.log("user insdie ctx =", ctx.user);

    const id = ctx.user?.id;
    if (!id) return null;

    //find the user in the database
    const user = await UserService.getUserById(id);

    return user;
  }, //solved the error always add Bearer before the token in the Authorization header

  //to get a user by id (to be used when you click on a profile of a user)
  getUserById: async (
    parent: any,
    { id }: { id: string },
    ctx: GraphqlContext
  ) => {
    const userById = await UserService.getUserById(id);

    console.log("userById =", userById);
    return userById;
  }, //change the id type to string if it creates issue
};

const extraResolvers = {
  User: {
    tweets: async (parent: User) => {
      const tweets = await prismaClient.tweet.findMany({
        where: { author: { id: parent.id } },
      });
      return tweets;
    },

    follower: async (parent: User) => {
      //will return followers where following Id is same as the parent id
      const followers = await prismaClient.follows.findMany({
        where: { following: { id: parent.id } },
        include: { follower: true },
      });
      return followers.map((f) => f.follower);
    },

    following: async (parent: User) => {
      //will return followers
      const followings = await prismaClient.follows.findMany({
        where: { follower: { id: parent.id } },
        include: { follower: true, following: true },
      });
      return followings.map((f) => f.following);
    },
  },
};

//follow and unfollow User Mutation
const mutations = {
  followUser: async (
    parent: any,
    { to }: { to: string },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user || !ctx.user.id) throw new Error("User not authenticated");

    const result = await UserService.followUser(ctx.user.id, to);
    return true;
  },

  unfollowUser: async (
    parent: any,
    { to }: { to: string },
    ctx: GraphqlContext
  ) => {
    if (!ctx.user || !ctx.user.id) throw new Error("User not authenticated");

    const result = await UserService.unfollowUser(ctx.user.id, to);
    return true;
  },
};

export const resolvers = { queries, extraResolvers, mutations };
