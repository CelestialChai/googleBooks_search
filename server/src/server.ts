import express from 'express';
import path from 'node:path';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import db from './config/connection';
import routes from './routes/index';
import typeDefs from './schemas/typeDefs';
import resolvers from './schemas/resolvers';
import { authenticateGraphQL } from './services/auth';


const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

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

db.once('open', async () => {
  await startApolloServer();
  app.use(routes);

  app.listen(PORT, () => {
    console.log(`🌍 Now listening on localhost:${PORT}`);
  });
});