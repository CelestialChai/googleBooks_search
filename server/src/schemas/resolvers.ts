import User from '../models/User';
import { signToken } from '../services/auth';

const resolvers = {
  Query: {
    // Query to get a user by either their ID or username
    getUser: async (_parent: any, { userId, username }: any, context: { user: { _id: any; }; }) => {
      try {
        // Ensure the user is authenticated
        if (context.user) {
          // If a user ID or username is provided, fetch accordingly
          const user = await User.findOne({
            $or: [{ _id: userId || context.user._id }, { username }],
          });
          if (!user) {
            throw new Error('Cannot find a user with this ID or username');
          }
          return user;
        }
        throw new Error('Not authenticated');
      } catch (err) {
        throw new Error(err.message);
      }
    },
  },

  Mutation: {
    // Mutation to create a user and return a token and user
    createUser: async (_parent: any, { username, email, password }: any) => {
      try {
        // Create the user
        const user = await User.create({ username, email, password });
        if (!user) {
          throw new Error('Something went wrong!');
        }

        // Generate a JWT token for the new user
        const token = signToken(user.username, user.password, user._id);
        return { token, user };
      } catch (err) {
        throw new Error('Error creating user: ' + err.message);
      }
    },

    // Mutation to log in a user, validate the password, and return a token
    login: async (_parent: any, { username, email, password }: any) => {
      try {
        // Find the user by username or email
        const user = await User.findOne({
          $or: [{ username }, { email }],
        });
        if (!user) {
          throw new Error("Can't find this user");
        }

        // Validate the password
        const correctPw = await user.isCorrectPassword(password);
        if (!correctPw) {
          throw new Error('Wrong password!');
        }

        // Generate a JWT token for the user
        const token = signToken(user.username, user.password, user._id);
        return { token, user };
      } catch (err) {
        throw new Error(err.message);
      }
    },

    // Mutation to save a book to the user's `savedBooks` field
    saveBook: async (_parent: any, { book }: any, context: { user: { _id: any; }; }) => {
      try {
        // Ensure the user is authenticated
        if (context.user) {
          // Add the book to the savedBooks array (avoiding duplicates)
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $addToSet: { savedBooks: book } },
            { new: true, runValidators: true }
          );
          return updatedUser;
        }
        throw new Error('Not authenticated');
      } catch (err) {
        throw new Error('Error saving book: ' + err.message);
      }
    },

    // Mutation to delete a book from the user's savedBooks field
    deleteBook: async (_parent: any, { bookId }: any, context: { user: { _id: any; }; }) => {
      try {
        // Ensure the user is authenticated
        if (context.user) {
          // Remove the book from the savedBooks array
          const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $pull: { savedBooks: { bookId } } },
            { new: true }
          );
          if (!updatedUser) {
            throw new Error("Couldn't find the user or book to remove!");
          }
          return updatedUser;
        }
        throw new Error('Not authenticated');
      } catch (err) {
        throw new Error('Error deleting book: ' + err.message);
      }
    },
  },
};

export default resolvers;