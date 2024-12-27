import { AuthenticationError } from 'apollo-server-express';
import User from '../models/User';
import { signToken } from '../services/auth';

const resolvers = {
  Query: {
    getSingleUser: async (_: any, args: { id?: string; username?: string }, context: any) => {
      const user = context.user;

      if (!user) {
        throw new AuthenticationError('You must be logged in');
      }

      const foundUser = await User.findOne({
        $or: [{ _id: user._id }, { username: args.username }],
      });

      if (!foundUser) {
        throw new Error('User not found');
      }

      return foundUser;
    },
  },
  Mutation: {
    createUser: async (_parent: any, args: { username: string; email: string; password: string }, _context: any) => {
     
      const user = await User.create(args);

      if (!user) {
        throw new Error('Something went wrong!');
      }

       const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },

    login: async (_parent: any, args: { username: string; email: string; password: string }, _context: any) => {
      const user = await User.findOne({
        $or: [{ username: args.username }, { email: args.email }],
      });

      if (!user) {
        throw new Error("Can't find this user");
      }

      const correctPw = await user.isCorrectPassword(args.password);

      if (!correctPw) {
        throw new Error('Wrong password!');
      }


      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },

    saveBook: async (_parent: any, args: { book: any }, context: any) => {
      const user = context.user;

      if (!user) {
        throw new AuthenticationError('You must be logged in');
      }

      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $addToSet: { savedBooks: args.book } },
        { new: true, runValidators: true }
      );

      return updatedUser;
    },

    deleteBook: async (_parent: any, args: { bookId: string }, context: any) => {
      const user = context.user;

      if (!user) {
        throw new AuthenticationError('You must be logged in');
      }

      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { savedBooks: { bookId: args.bookId } } },
        { new: true }
      );

      if (!updatedUser) {
        throw new Error("Couldn't find user with this id!");
      }

      return updatedUser;
    },
  },
};

export default resolvers;