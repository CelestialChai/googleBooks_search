import { gql } from 'apollo-server-express';

//Book
const BookType = gql`
  type Book {
    bookId: String!
    authors: [String]
    description: String
    title: String
    image: String
    link: String
  }
`;

//User
const UserType = gql`
  type User {
    _id: ID!
    username: String!
    email: String!
    bookCount: Int!
    savedBooks: [Book]
  }
`;

//Auth
const AuthType = gql`
  type Auth {
    token: String!
    user: User!
  }
`;

//Query
const QueryType = gql`
  type Query {
    me: User!
  }
`;

//Mutation
const MutationType = gql`
  type Mutation {
    # Login mutation - accepts email and password and returns an Auth object
    login(email: String!, password: String!): Auth!

    # Add new user - accepts username, email, and password and returns an Auth object
    addUser(username: String!, email: String!, password: String!): Auth!

    # Save a book to a user's savedBooks field - returns the updated User object
    saveBook(
      authors: [String]!
      description: String!
      title: String!
      bookId: String!
      image: String!
      link: String!
    ): User!

    # Remove a book from savedBooks - returns the updated User object
    removeBook(bookId: String!): User!
  }
`;

export default [BookType, UserType, AuthType, QueryType, MutationType];