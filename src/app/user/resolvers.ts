
//the actiual resolver to be used while queriying
const queries={
    verifyGoogleToken:async(parent:any,{token}:{token:string})=>{
        return token;
    }
}

export const resolvers={queries}