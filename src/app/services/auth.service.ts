import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly hardcodedUsername = 'admin';
  private readonly hardcodedPassword = 'admin';

  login(username: string, password: string): boolean {
    if (
      username === this.hardcodedUsername &&
      password === this.hardcodedPassword
    ) {
      localStorage.setItem('isLoggedIn', 'true');
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem('isLoggedIn');
  }

  isAuthenticated(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }
}
