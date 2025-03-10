import { describe, expect, test, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';
import { mockAuth } from '../tests/mockAuth';
import 'src/pages/setupTests.jsx'; // Import the setup file

import { fetchGroupData } from '../utils/fetchGroupData';

vi.mock('../utils/fetchGroupData')

const mockFetchGroupData = {
  "participants": ["KDGFyjlI7LX3elQKqck5KrBzH7E2", "b9kiedtQScRnnBPCqm12AIYFCtF2"],
  "proposedStart": "9",
  "proposedEnd": "18.5",
  "title": "Test Group",
  "proposedDays": [
    Date("2022-02-28T00:00:00.000Z"),
    Date("2022-03-01T00:00:00.000Z"),
    Date("2022-03-02T00:00:00.000Z"),
  ],
  "groupId": "xhpz6m4",
}

// Mock the firebase fetchGroupData function 
describe('mocking firebase call', () => {
  test("test get group data from db", async () => {
    render(<App />);
    fetchGroupData.mockResolvedValue(mockFetchGroupData);
    await screen.findByText(/xhpz6m4/i);
    await screen.findByText(/Test Group/i);
  });
});

describe('counter tests', () => {
    
  test("Login button", () => {
    render(<App />);
    expect(screen.getByText('Login')).toBeDefined();
  });
});

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