import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { fileURLToPath } from 'url';
import path from 'path';
import cors from 'cors';
import db from './config/connection.js';
import routes from './routes/index.js';
import typeDefs from './schemas/typeDefs.js';
import resolvers from './schemas/resolvers.js';
import { authenticateGraphQL } from './services/auth.js';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('JWT_SECRET_KEY:', process.env.JWT_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3001;

// Updated CORS configuration
const corsOptions = {
  origin: ['http://localhost:3000', 'https://googlebooks-search.onrender.com'], // Update with your client origin
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'x-apollo-operation-name',
    'apollo-require-preflight',
  ],
  credentials: true,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
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
    })
  );
}

// Connect to the database and start the server
db.once('open', async () => {
  await startApolloServer();
  app.use(routes);

  app.listen(PORT, () => {
    console.log(`🌍 Server running on http://localhost:${PORT}`);
  });
});