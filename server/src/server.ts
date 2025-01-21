import express from 'express';
import path from 'node:path';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import db from './config/connection.js';
import routes from './routes/index.js';
import typeDefs from './schemas/typeDefs.js';
import resolvers from './schemas/resolvers.js';
import { authenticateGraphQL } from './services/auth.js';
import User from './models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cors from 'cors';

// Updated CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000', // Allow the frontend's origin
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'], // Add OPTIONS for preflight requests
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // Ensure that necessary headers are allowed
  credentials: true, // Allow cookies and authentication
};

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build', 'index.html')));
}

app.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign({ userId: newUser._id, username: newUser.username }, process.env.JWT_SECRET!, {
      expiresIn: '1h',
    });

    return res.status(200).json({ token });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Something went wrong during signup' });
  }
});

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