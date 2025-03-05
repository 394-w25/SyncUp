import {describe, expect, test, vi, it} from 'vitest';
import {fireEvent, render, screen} from '@testing-library/react';
import App from './App';
import MeetingPage from './MeetingPage';
import { fetchGroupData } from "../utils/fetchGroupData";

vi.mock("../utils/fetchGroupData", () => ({
  fetchGroupData: vi.fn(),
}));

describe('counter tests', () => {
  const mockGroupData = {
    "createdAt": "February 6, 2025 at 11:30:51 AM UTC-6",
    "creator": "abc",
    "groupId": "123",
    "participants": [],
    "proposedDays": [],
    "proposedEnd": 19.5,
    "proposedStart": 8,
    "title": "mock meeting",
  }
  vi.mock("src/utils/fetchGroupData.js");

  it ('get user data', async() => {
    fetchGroupData.mockReturnValue(Promise.resolve[mockGroupData]);
    render(<MeetingPage/>);
    expect(await screen.findByText('123')).toBeInTheDocument();
  })

});