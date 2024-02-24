import axios from "axios";
import { prismaClient } from "../clients/db";
import JWTService from "./jwt";

//type for google OAuth token
interface GoogleTokenResult {
  iss?: string;
  azp?: string;
  aud?: string;
  sub?: string;
  email: string;
  email_verified: string;
  nbf?: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
  iat?: string;
  exp?: string;
  jti?: string;
  alg?: string;
  kid?: string;
  typ?: string;
}

class UserService {
  public static async verifyGoogleAuthToken(token: string) {
    //remember the GOOGLE OAUTH TOKEN is short lived so can cause errors during testing
    const googleToken = token; //this token is the Google OAuth jwt token that we will get after logging in the site

    const googleOauthURL = new URL("https://oauth2.googleapis.com/tokeninfo");
    //console.log(googleOauthURL)

    googleOauthURL.searchParams.append("id_token", googleToken); ///adding the jwt token to the search param

    //this data will contain all the data of the user
    const { data } = await axios.get<GoogleTokenResult>(
      googleOauthURL.toString(),
      { responseType: "json" }
    ); //making the request to google oauth server
    //console.log(data)

    //check if user is present already in database or not
    const user = await prismaClient.user.findUnique({
      where: { email: data.email },
    });

    //if user is not present in database then create one
    if (!user) {
      await prismaClient.user.create({
        data: {
          email: data.email,
          firstName: data.given_name || "", // Provide a default value if data.given_name is undefined
          lastName: data.family_name,
          profileImageURL: data.picture,
        },
      });
    }

    const userInDb = await prismaClient.user.findUnique({
      where: { email: data.email },
    });

    if (!userInDb) {
      throw new Error("User with email not found");
    }

    const userToken = await JWTService.generateTokenForUser(userInDb);
    console.log(
      "userToken generated from fetching user details from supabase =",
      userToken
    );
    return userToken;
  }

  public static async getUserById(id: string) {
    return prismaClient.user.findUnique({ where: { id } });
  }


  //should add async to the function rather than adding async and await in the calling function
  //follow a User
  public static followUser(from: string, to: string) {
    //from is the follower and to is the following
    return prismaClient.follows.create({
      data: {
        follower: { connect: { id: from } },
        following: { connect: { id: to } },
      },
    });
  }


  //unfollow a User
  public static unfollowUser(from: string, to: string) {
    return prismaClient.follows.delete({
      where: {
        followerId_followingId: {
          followerId: from,
          followingId: to,
        },
      },
    });
  }
}

export default UserService;
