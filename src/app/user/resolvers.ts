import axios from 'axios';
import { prismaClient } from '../../clients/db';
import JWTService from '../../services/jwt';
import { GraphqlContext } from '../../interfaces';


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



const queries={
    
    //verifyGoogletoken Query will take google OAuth token and verify it and then return our own jwt token with only email and id as the payload
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
        console.log("userToken generated from fetching user details from supabase =",userToken);
        return userToken;
    },

    
    //getCurrentUser Returns the current user details and will also create the user if not present in the database
    //this assumes we have already decoded the JWT token and provided it in the Context of the Graphql Server
    getCurrentUser:async(parent:any,args:any,ctx:GraphqlContext)=>{
        console.log("ctx or GraphQl Context =",ctx);
        console.log("user insdie ctx =",ctx.user);

        const id=ctx.user?.id;
        if(!id) return null;


        //find the user in the database
        const user=await prismaClient.user.findUnique({where:{id}});

    return user
    }//solved the error alwayu=s add Bearer before the token in the Authorization header



}

export const resolvers={queries}