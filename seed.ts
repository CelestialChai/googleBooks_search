import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import User from './server/src/models/User.js';

const MONGO_URI = 'mongodb://localhost:27017/googlebooks';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    const existingUser = await User.findOne({ email: 'example@gmail.com' });
    if (existingUser) {
      console.log('User already exists in the database!');
      return;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('123456789', saltRounds);

    const user = new User({
      username: 'spacesans',
      email: 'example@gmail.com',
      password: hashedPassword,
      savedBooks: [],
    });

    await user.save();
    console.log('User seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedDatabase();