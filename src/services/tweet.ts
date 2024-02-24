import { prismaClient } from "../clients/db";

export interface CreateTweetPayload {
  content: string;
  imageURL?: string;
  userId: string;
}

class TweetService {
  //for creating a tweet
  public static createTweet(data: CreateTweetPayload) {
    return prismaClient.tweet.create({
      data: {
        content: data.content,
        imageURL: data.imageURL,
        author: { connect: { id: data.userId } },
      },
    });
  }

  //for getting all the tweets
  public static getAllTweets() {
    return prismaClient.tweet.findMany({
      orderBy: { createdAt: "desc" },
    });
  }
}

export default TweetService;
