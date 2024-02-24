
// the #graphql comment  will get ommited by the graphql server
export const types=` #graphql

 type User{
   id:ID!
   firstName:String!
   lastName:String!
   email:String!
   profileImageURL:String!

   follower:[User]
   following:[User]

   tweets:[Tweet]

 }

`
//the types for graphql query which will return a User type