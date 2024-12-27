import { jwtDecode } from 'jwt-decode';

interface UserToken {
  name: string;
  exp: number;
}

class Auth {
  getProfile(): UserToken | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    return jwtDecode<UserToken>(token);
  }

  loggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode<UserToken>(token);
      if (decoded.exp < Date.now() / 1000) {
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('id_token');
  }

  login(idToken: string): void {
    localStorage.setItem('id_token', idToken);
    window.location.assign('/');
  }

  logout(): void {
    localStorage.removeItem('id_token');
    window.location.assign('/');
  }
}

export default new Auth();