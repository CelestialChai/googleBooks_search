import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import 'bootstrap/dist/css/bootstrap.min.css';

import App from './App.jsx';
import SearchBooks from './pages/SearchBooks';
import SavedBooks from './pages/SavedBooks';
import Auth from './utils/auth'; // Ensure this path is correct for your project structure

// Create an HTTP link to your GraphQL server
const httpLink = createHttpLink({
  uri: 'http://localhost:3001/graphql',
  credentials: 'include',
});

// Use `setContext` to dynamically set the `Authorization` header with the token
const authLink = setContext((_, { headers }) => {
  const token = Auth.getToken();
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Combine the authLink with the httpLink
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <h1 className="display-2">Wrong page!</h1>,
    children: [
      {
        index: true,
        element: <SearchBooks />,
      },
      {
        path: '/saved',
        element: <SavedBooks />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ApolloProvider client={client}>
    <RouterProvider router={router} />
  </ApolloProvider>
);