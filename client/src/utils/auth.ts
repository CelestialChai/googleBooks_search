import { jwtDecode } from 'jwt-decode';

interface UserToken {
  _id: string;
  username: string;
  email: string;
  exp: number;
}

class Auth {
  getProfile(): UserToken | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    try {
      return jwtDecode<UserToken>(token);
    } catch (err) {
      console.error('Error decoding token in getProfile:', err);
      return null;
    }
  }

  loggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<UserToken>(token);
      return decoded.exp < Date.now() / 1000;
    } catch (err) {
      console.error('Error decoding token in isTokenExpired:', err);
      return true; // Assume token is expired if decoding fails
    }
  }

  getToken(): string | null {
    return localStorage.getItem('id_token');
  }

  login(idToken: string): void {
    console.log('Logging in with token:', idToken); // Debugging log
    localStorage.setItem('id_token', idToken);
    window.location.assign('/'); // Redirect to home page
  }

  logout(): void {
    console.log('Logging out user'); // Debugging log
    localStorage.removeItem('id_token');
    window.location.assign('/'); // Redirect to home page
  }
}

export default new Auth();
