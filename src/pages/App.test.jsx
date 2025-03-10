import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import { mockAuth } from '../tests/mockAuth';
import 'src/pages/setupTests.jsx'; // Import the setup file

// Mock the authentication module
vi.mock('../services/googleAuth', () => ({
  handleAuth: mockAuth.signIn,
  signOut: mockAuth.signOut,
}));

describe('App tests', () => {
  test('Login button', () => {
    render(<App />);
    expect(screen.getByText('Login')).toBeDefined();
  });

  test('Authenticated user', async () => {
    // Simulate user authentication
    await mockAuth.signIn();

    render(<App />);
    expect(screen.getByText('Welcome, Mock User!')).toBeDefined();
  });
});