import { gql } from '@apollo/client';
import { ApolloClient, InMemoryCache, } from '@apollo/client';
import Auth from './auth';

const GET_ME = gql`
  query GetMe {
    me {
      _id
      username
      email
    }
  }
`;

const CREATE_USER = gql`
  mutation CreateUser($username: String!, $email: String!, $password: String!) {
    createUser(username: $username, email: $email, password: $password) {
      token
    }
  }
`;

const LOGIN_USER = gql`
  mutation LoginUser($email: String!, $password: String!) {
    loginUser(email: $email, password: $password) {
      token
    }
  }
`;

const SAVE_BOOK = gql`
  mutation SaveBook($bookData: BookInput!) {
    saveBook(bookData: $bookData) {
      _id
      title
      authors
      description
    }
  }
`;

const DELETE_BOOK = gql`
  mutation DeleteBook($bookId: String!) {
    deleteBook(bookId: $bookId) {
      _id
      title
    }
  }
`;

const API = {
  getMe: () => {
    return client.query({
      query: GET_ME,
      context: {
        headers: {
          Authorization: `Bearer ${Auth.getToken()}`,
        },
      },
    });
  },

  createUser: (userData: { username: string; email: string; password: string }) => {
    return client.mutate({
      mutation: CREATE_USER,
      variables: userData,
    });
  },

  loginUser: (userData: { email: string; password: string }) => {
    return client.mutate({
      mutation: LOGIN_USER,
      variables: userData,
    });
  },

  saveBook: (bookData: { title: string; authors: string[]; description: string }) => {
    return client.mutate({
      mutation: SAVE_BOOK,
      variables: { bookData },
      context: {
        headers: {
          Authorization: `Bearer ${Auth.getToken()}`,
        },
      },
    });
  },

  deleteBook: (bookId: string) => {
    return client.mutate({
      mutation: DELETE_BOOK,
      variables: { bookId },
      context: {
        headers: {
          Authorization: `Bearer ${Auth.getToken()}`,
        },
      },
    });
  },

  searchGoogleBooks: (query: string) => {
    return fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}`);
  },
};

const client = new ApolloClient({
  uri: 'https://googlebooks-search.onrender.com',
  cache: new InMemoryCache(),
});

export default API;