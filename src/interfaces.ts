export  interface JWTUser{//the type for user data in the jwt token
    id:string;
    email:string;
    firstName:string | null;
    lastName:string  | null;

}


//this is like the type for entire data type/context/metadata for the whole Graphql Server
export interface GraphqlContext{
    user?:JWTUser;
}