# GoogleBooks App

## Description
The GoogleBooks App is a full-stack MERN (MongoDB, Express, React, Node.js) application that allows users to search for books using the Google Books API, save their favorite books to a personal account, and manage their saved books. This project demonstrates user authentication, GraphQL integration, and the use of React with Apollo Client for a seamless front-end experience.

---

## Features

### Client-Side
- **Search Books**: Users can search for books using the Google Books API.
- **Save Books**: Authenticated users can save books to their personal account.
- **Manage Saved Books**: Users can view and delete books from their saved list.
- **Authentication**: Login and Signup functionality.

### Server-Side
- **GraphQL API**: A GraphQL API built with Apollo Server provides data and handles user actions.
- **MongoDB Atlas**: User and book data is stored in a MongoDB Atlas database.
- **Authentication**: Secure authentication with JSON Web Tokens (JWT).

---

## Technologies Used

### Frontend
- React
- Apollo Client
- React Bootstrap
- TypeScript

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Apollo Server (GraphQL)
- JWT for authentication
- bcrypt for password hashing

---

## Installation

### Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/)
- A MongoDB Atlas database set up
- A Google Books API key

### Clone the Repository
```bash
git clone <repository-url>
cd googlebooks-app
```

### Install Dependencies
```bash
# Install dependencies for the server
cd server
npm install

# Install dependencies for the client
cd ../client
npm install
```

---

## Configuration

### Environment Variables
Create a `.env` file in the `server` directory with the following variables:

```plaintext
MONGODB_URI=<your-mongodb-atlas-uri>
JWT_SECRET_KEY=<your-jwt-secret>
NODE_ENV=production
PORT=3001
```

---

## Usage

### Development
To run the application in development mode:
```bash
cd googlebooks-app
npm run develop
```
This will concurrently start the client and server.

### Production Build
To build the application for production:
```bash
npm run build
```
Then, start the server:
```bash
cd server
npm start
```

---

## API Endpoints

### GraphQL API
**Base URL:** `/graphql`

---

## Features
- **Search Page**: Allows users to search for books.
- **Saved Books Page**: Displays the list of saved books for authenticated users.

---

## License
None

---

## Contributors
- [Amanda Gipson - Github](https://github.com/celestialchai)
- [Walkthrough Video](https://youtube.com)

---

## Acknowledgements
- [Google Books API](https://developers.google.com/books)
- [Render](https://render.com) for deployment
- [React Bootstrap](https://react-bootstrap.github.io/) for UI components
