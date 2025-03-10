import { vi } from 'vitest';
import { mockAuth } from '../tests/mockAuth';

// Mock the authentication module
vi.mock('./services/googleAuth', () => ({
  handleAuth: mockAuth.signIn,
  signOut: mockAuth.signOut,
}));