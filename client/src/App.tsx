import './App.css';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import { ApolloProvider, InMemoryCache } from '@apollo/client';
import { ApolloClient } from '@apollo/client';

// Initialize Apollo Client
const client = new ApolloClient({
  uri: '/graphql', // Update this URL if your GraphQL server is hosted elsewhere
  cache: new InMemoryCache(),
});

function App() {
  return (
   
    <ApolloProvider client={client}>
      <Navbar />
      <Outlet />
    </ApolloProvider>
  );
}

export default App;