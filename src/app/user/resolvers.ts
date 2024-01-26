import axios from 'axios';
import { prismaClient } from '../../clients/db';
import JWTService from '../../services/jwt';


//type for google OAuth token
interface GoogleTokenResult{
    iss?: string;
  azp?: string;
  aud?: string;
  sub?: string;
  email: string;
  email_verified: string;
  nbf?: string;
  name: string ;
  picture?: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
  iat?: string;
  exp?: string;
  jti?:  string;
  alg?:  string;
  kid?:  string;
  typ?: string;
}


//this resolver willl take the google OAuth token and verify it and then return our own jwt token with only email and id as the payload
const queries={
    verifyGoogleToken:async(parent:any,{token}:{token:string})=>{

        //remember the GOOGLE OAUTH TOKEN is short lived so can cause errors during testing
        const googleToken=token;//this token is the Google OAuth jwt token that we will get after logging in the site

        const googleOauthURL=new URL("https://oauth2.googleapis.com/tokeninfo");
        //console.log(googleOauthURL)

        googleOauthURL.searchParams.append("id_token",googleToken);///adding the jwt token to the search param


        //this data will contain all the data of the user
        const {data} = await axios.get<GoogleTokenResult>(googleOauthURL.toString()
        ,{responseType:"json"});//making the request to google oauth server
        //console.log(data)


        //check if user is present already in database or not
        const user = await prismaClient.user.findUnique({ where: { email: data.email } });

        //if user is not present in database then create one
        if (!user) {
            await prismaClient.user.create({
                data: {
                    email: data.email,
                    firstName: data.given_name || '', // Provide a default value if data.given_name is undefined
                    lastName: data.family_name,
                    profileImageURL: data.picture,
                },
            });
        }


        const userInDb=await prismaClient.user.findUnique({where:{email:data.email}});

        if(!userInDb){throw new Error("User with email not found")}

        const userToken=await JWTService.generateTokenForUser(userInDb);
        return userToken;
    }

}

export const resolvers={queries}