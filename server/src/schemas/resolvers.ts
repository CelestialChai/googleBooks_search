import { AuthenticationError } from 'apollo-server-express';
import User, { UserDocument } from '../models/User.js';
import { signToken } from '../services/auth.js';

const resolvers = {
  Query: {
    // Fetch the currently authenticated user
    me: async (_parent: any, _args: any, context: any): Promise<UserDocument> => {
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
    getSingleUser: async (
      _parent: any,
      { id, username }: { id?: string; username?: string }
    ): Promise<UserDocument | null> => {
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
    // Add a new user
    addUser: async (
      _parent: any,
      { username, email, password }: { username: string; email: string; password: string }
    ): Promise<{ token: string; user: UserDocument }> => {
      try {
        console.log('Input received:', { username, email, password });

        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new Error('User with this email already exists');
        }

        const newUser = await User.create({ username, email, password });
        console.log('User created successfully:', newUser);

        const token = signToken(newUser.username, newUser.email, newUser._id);
        return { token, user: newUser };
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(error.message);
        } else {
          throw new Error('An unknown error occurred');
        }
      }
    },

    // Save a book to the user's savedBooks array
    saveBook: async (
      _parent: any,
      { book }: { book: { authors: string[]; description: string; title: string; bookId: string; image?: string; link?: string } },
      context: any
    ): Promise<UserDocument> => {
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
    removeBook: async (_parent: any, { bookId }: { bookId: string }, context: any): Promise<UserDocument> => {
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