import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ME } from '../utils/queries';
import { REMOVE_BOOK, SAVE_BOOK } from '../utils/mutations';
import Auth from '../utils/auth';
import { removeBookId } from '../utils/localStorage';
import type { Book, User } from '../models';

const SavedBooks = () => {
  // Fetch user data using Apollo's `useQuery` hook
  const { loading, data } = useQuery<{ me: User }>(GET_ME, {
    fetchPolicy: 'network-only', // Ensures fresh data is fetched from the server
  });
  const userData = data?.me;

  // Mutation to save a book
  const [saveBook, { error: saveError }] = useMutation(SAVE_BOOK);

  // Mutation to remove a book
  const [removeBook, { error: removeError }] = useMutation(REMOVE_BOOK);

  const handleDeleteBook = async (bookId: string) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      console.error('No valid token found.');
      return false;
    }

    try {
      // Execute REMOVE_BOOK mutation
      const { data } = await removeBook({
        variables: { bookId },
        update(cache) {
          const normalizedId = cache.identify({ id: bookId, __typename: 'Book' });
          cache.evict({ id: normalizedId });
          cache.gc();
        },
      });

      if (data?.removeBook) {
        console.log(`Book with ID ${bookId} removed successfully.`);
      }

      // Remove the book's ID from localStorage
      removeBookId(bookId);
    } catch (err) {
      console.error('Error removing book:', err);
    }
  };

  const handleSaveBook = async (book: Book) => {
    const token = Auth.loggedIn() ? Auth.getToken() : null;

    if (!token) {
      console.error('No valid token found.');
      return false;
    }

    try {
      console.log('Book data being sent to mutation:', book);
      // Execute SAVE_BOOK mutation
      const { data } = await saveBook({
        variables: {
          book: {
            authors: book.authors,
            description: book.description,
            title: book.title,
            bookId: book.bookId,
            image: book.image,
            link: book.link,
          },
        },
      });

      if (data?.saveBook) {
        console.log(`Book titled "${book.title}" saved successfully.`);
      }
    } catch (err) {
      console.error('Error saving book:', err);
    }
  };

  // Display loading state
  if (loading) {
    return <h2>LOADING...</h2>;
  }

  // Display errors for mutations
  if (saveError) {
    console.error('Error in SAVE_BOOK mutation:', saveError.message);
  }
  if (removeError) {
    console.error('Error in REMOVE_BOOK mutation:', removeError.message);
  }

  return (
    <>
      <div className="text-light bg-dark p-5">
        <Container>
          {userData?.username ? (
            <h1>Viewing {userData.username}'s saved books!</h1>
          ) : (
            <h1>Viewing saved books!</h1>
          )}
        </Container>
      </div>
      <Container>
        <h2 className="pt-5">
          {userData?.savedBooks?.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? 'book' : 'books'
              }`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData?.savedBooks?.map((book: Book) => (
            <Col md="4" key={book.bookId}>
              <Card border="dark">
                {book.image && (
                  <Card.Img
                    src={book.image}
                    alt={`The cover for ${book.title}`}
                    variant="top"
                  />
                )}
                <Card.Body>
                  <Card.Title>{book.title}</Card.Title>
                  <p className="small">Authors: {book.authors.join(', ')}</p>
                  <Card.Text>{book.description}</Card.Text>
                  <Button
                    className="btn-block btn-success mb-2"
                    onClick={() => handleSaveBook(book)}
                  >
                    Save this Book!
                  </Button>
                  <Button
                    className="btn-block btn-danger"
                    onClick={() => handleDeleteBook(book.bookId)}
                  >
                    Delete this Book!
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
