
// the #graphql comment  will get ommited by the graphql server
export const types=` #graphql

 type User{
   id:ID!
   firsName:String!
   lastName:String!
   email:String!
   profileImageURL:String!

 }

`
//the types for graphql query which will return a User type