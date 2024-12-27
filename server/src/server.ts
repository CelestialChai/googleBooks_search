import express from 'express';
import path from 'node:path';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import db from './config/connection.js';
import routes from './routes/index.js';
import typeDefs from './graphql/typeDefs';
import resolvers from './graphql/resolvers';
import { authenticateGraphQL } from './middleware/auth';
import type { JwtPayload } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware to parse URL-encoded and JSON data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Apollo Server setup
async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  // Apply Apollo Server middleware
  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => {
        const authHeader = req.headers.authorization || '';
        const user = authenticateGraphQL(authHeader);
        return { user };
      },
    }),
  );
}

// Connect to the database and start the server
db.once('open', async () => {
  await startApolloServer(); // Start Apollo Server
  app.use(routes); // Use REST routes

  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
});
