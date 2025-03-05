import {describe, expect, test} from 'vitest';
import {fireEvent, render, screen} from '@testing-library/react';
import App from './App';

describe('counter tests', () => {
    
  test("Login button", () => {
    render(<App />);
    expect(screen.getByText('Login')).toBeDefined();
  });

});