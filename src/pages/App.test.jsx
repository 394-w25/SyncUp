import {describe, expect, test} from 'vitest';
import {fireEvent, render, screen} from '@testing-library/react';
import App from './App';

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