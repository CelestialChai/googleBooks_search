import { gql } from 'apollo-server-express';

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

const UserType = gql`
  type User {
    _id: ID!
    username: String!
    email: String!
    bookCount: Int!
    savedBooks: [Book]
  }
`;

const AuthType = gql`
  type Auth {
    token: String!
    user: User!
  }
`;

const SaveBookInputType = gql`
  input SaveBookInput {
    authors: [String]!
    description: String!
    title: String!
    bookId: String!
    image: String!
    link: String!
  }
`;

const QueryType = gql`
  type Query {
    me: User!
  }
`;

const MutationType = gql`
  type Mutation {
    login(email: String!, password: String!): Auth!
    addUser(username: String!, email: String!, password: String!): Auth!
    saveBook(book: SaveBookInput!): User!
    removeBook(bookId: String!): User!
  }
`;

export default [BookType, UserType, AuthType, SaveBookInputType, QueryType, MutationType];