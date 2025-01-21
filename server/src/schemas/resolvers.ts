import { AuthenticationError } from 'apollo-server-express';
import User from '../models/User.js';
import { signToken } from '../services/auth.js';

const resolvers = {
  Query: {
    // Fetch the currently authenticated user
    me: async (_parent: any, _args: any, context: any) => {
      const user = context.user;

      if (!user) {
        throw new AuthenticationError('You must be logged in');
      }

      const foundUser = await User.findById(user._id);

      if (!foundUser) {
        throw new Error('User not found');
      }

      return foundUser;
    },

    // Fetch a single user by ID or username
    getSingleUser: async (_parent: any, { id, username }: { id?: string; username?: string }) => {
      const foundUser = await User.findOne({
        $or: [{ _id: id }, { username }],
      });

      if (!foundUser) {
        throw new Error('User not found');
      }

      return foundUser;
    },
  },

  Mutation: {
    // Create a new user
    addUser: async (_parent: any, { username, email, password }: { username: string; email: string; password: string }) => {
      try {
        // Check if a user with the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new Error('User with this email already exists');
        }

        // Create the new user
        const newUser = await User.create({ username, email, password });

        // Generate a JSON Web Token for the new user
        const token = signToken(newUser.username, newUser.email, newUser._id);

        // Return the token and the newly created user
        return { token, user: newUser };
      } catch (error) {
        if (error instanceof Error) {
          console.error('Error in addUser resolver:', error.message);
        } else {
          console.error('Error in addUser resolver:', error);
        }
        throw new Error('Failed to create user. Please try again.');
      }
    },

    // Login an existing user
    login: async (_parent: any, { email, password }: { email: string; password: string }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new Error("Can't find this user");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new Error('Wrong password!');
      }

      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },

    // Save a book to the user's savedBooks array
    saveBook: async (_parent: any, { book }: { book: any }, context: any) => {
      const user = context.user;

      if (!user) {
        throw new AuthenticationError('You must be logged in');
      }

      const updatedUser = await User.findByIdAndUpdate(
        { _id: user._id },
        { $addToSet: { savedBooks: book } },
        { new: true, runValidators: true }
      );

      if (!updatedUser) {
        throw new Error('Error saving the book');
      }

      return updatedUser;
    },

    // Remove a book from the user's savedBooks array
    removeBook: async (_parent: any, { bookId }: { bookId: string }, context: any) => {
      const user = context.user;

      if (!user) {
        throw new AuthenticationError('You must be logged in');
      }

      const updatedUser = await User.findByIdAndUpdate(
        { _id: user._id },
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error("Couldn't find user with this ID!");
      }

      return updatedUser;
    },
  },
};

export default resolvers;