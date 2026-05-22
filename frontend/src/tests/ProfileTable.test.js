import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ProfileTable from '../components/ProfileTable';

// Mock fetch
global.fetch = jest.fn();

// Mock sessionStorage
const mockUser = {
  email: 'admin@stokvel.com',
  name: 'Admin User',
  role: 'Admin'
};

beforeEach(() => {
  jest.clearAllMocks();
  Storage.prototype.getItem = jest.fn(() => JSON.stringify(mockUser));
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('ProfileTable Component', () => {

  test('renders loading state initially', () => {
    fetch.mockImplementationOnce(() => new Promise(() => {}));
    
    render(<ProfileTable />);
    
    expect(screen.getByText('Loading users...')).toBeInTheDocument();
  });

  test('displays users table after successful fetch', async () => {
    const mockUsers = {
      users: [
        {
          name: 'John Doe',
          email: 'john@test.com',
          role: 'Admin',
          memberId: 'MEM001',
          joinDate: '2024-01-15T00:00:00.000Z'
        }
      ]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers
    });

    render(<ProfileTable />);

    await waitFor(() => {
      expect(screen.getByText('All Members')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  test('displays table headers correctly', async () => {
    const mockUsers = { users: [] };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers
    });

    render(<ProfileTable />);

    await waitFor(() => {
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();
      expect(screen.getByText('Role')).toBeInTheDocument();
      expect(screen.getByText('Member ID')).toBeInTheDocument();
      expect(screen.getByText('Join Date')).toBeInTheDocument();
    });
  });

  test('displays user avatar with first letter of name', async () => {
    const mockUsers = {
      users: [
        {
          name: 'John Doe',
          email: 'john@test.com',
          role: 'Admin',
          memberId: 'MEM001',
          joinDate: '2024-01-15T00:00:00.000Z'
        }
      ]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers
    });

    render(<ProfileTable />);

    await waitFor(() => {
      const avatar = screen.getByText('J');
      expect(avatar).toBeInTheDocument();
    });
  });

  test('displays N/A for missing member ID', async () => {
    const mockUsers = {
      users: [
        {
          name: 'John Doe',
          email: 'john@test.com',
          role: 'Admin',
          memberId: null,
          joinDate: '2024-01-15T00:00:00.000Z'
        }
      ]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers
    });

    render(<ProfileTable />);

    await waitFor(() => {
      expect(screen.getByText('N/A')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<ProfileTable />);

    await waitFor(() => {
      expect(screen.getByText('Loading users...')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });
});
