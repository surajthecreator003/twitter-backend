export const types=`#graphql

input CreateTweetData{
    content:String!
    imageURL:String
    
}

type Tweet{
      id:ID!
      content:String!
      imageURL:String

      author:User
}


`

// the author will get triggered automatically with the extra resolver
//i spread upon the resolvers