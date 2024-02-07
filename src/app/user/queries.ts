

//these are the query types under other types
//use this in apolo or frontend to query the data
export const queries=` #graphql

   verifyGoogleToken(token:String!):String

   getCurrentUser:User

   getUserById(id:ID!):User

`;