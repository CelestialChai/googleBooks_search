import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';

import { useMutation } from '@apollo/client';
import { ADD_USER } from '../utils/mutations';
import Auth from '../utils/auth';
import type { User } from '../models/User';

const SignupForm = ({ handleModalClose }: { handleModalClose: () => void }) => {
  // Set initial form state
  const [userFormData, setUserFormData] = useState<User>({
    username: '',
    email: '',
    password: '',
    savedBooks: [],
  });
  // Set state for form validation
  const [validated, setValidated] = useState(false);
  // Set state for alert
  const [showAlert, setShowAlert] = useState(false);

  // GraphQL mutation
  const [addUser] = useMutation(ADD_USER, {
    onCompleted: ({ addUser }) => {
      const { token } = addUser;
      Auth.login(token); // Log in the user with the received token
      handleModalClose(); // Close the modal
    },
    onError: () => {
      setShowAlert(true); // Show alert on error
    },
  });

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setUserFormData({ ...userFormData, [name]: value });
  };

  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Check if form has everything (as per react-bootstrap docs)
    const form = event.currentTarget;
    if (form.checkValidity() === false) {
      setValidated(true);
      event.stopPropagation();
      return;
    }

    try {
      // Execute the GraphQL mutation
      await addUser({
        variables: {
          username: userFormData.username,
          email: userFormData.email,
          password: userFormData.password,
        },
      });
    } catch (err) {
      console.error('Error during signup:', err);
      setShowAlert(true);
    }

    // Reset the form data after successful submission
    setUserFormData({
      username: '',
      email: '',
      password: '',
      savedBooks: [],
    });
  };

  return (
    <Form noValidate validated={validated} onSubmit={handleFormSubmit}>
      {/* Show alert if server response is bad */}
      <Alert dismissible onClose={() => setShowAlert(false)} show={showAlert} variant="danger">
        Something went wrong with your signup!
      </Alert>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="username">Username</Form.Label>
        <Form.Control
          type="text"
          placeholder="Your username"
          name="username"
          onChange={handleInputChange}
          value={userFormData.username || ''}
          required
        />
        <Form.Control.Feedback type="invalid">Username is required!</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="email">Email</Form.Label>
        <Form.Control
          type="email"
          placeholder="Your email address"
          name="email"
          onChange={handleInputChange}
          value={userFormData.email || ''}
          required
        />
        <Form.Control.Feedback type="invalid">Email is required!</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="password">Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Your password"
          name="password"
          onChange={handleInputChange}
          value={userFormData.password || ''}
          required
        />
        <Form.Control.Feedback type="invalid">Password is required!</Form.Control.Feedback>
      </Form.Group>

      <Button
        disabled={!(userFormData.username && userFormData.email && userFormData.password)}
        type="submit"
        variant="success"
      >
        Submit
      </Button>
    </Form>
  );
};

export default SignupForm;