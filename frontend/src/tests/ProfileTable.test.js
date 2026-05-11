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
        },
        {
          name: 'Jane Smith',
          email: 'jane@test.com',
          role: 'Member',
          memberId: 'MEM002',
          joinDate: '2024-02-20T00:00:00.000Z'
        },
        {
          name: 'Bob Johnson',
          email: 'bob@test.com',
          role: 'Treasurer',
          memberId: 'MEM003',
          joinDate: '2024-03-10T00:00:00.000Z'
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
      expect(screen.getByText('jane@test.com')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
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

  test('displays correct role badge for Admin user', async () => {
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
      const adminBadge = screen.getByText('Admin');
      expect(adminBadge).toBeInTheDocument();
      expect(adminBadge).toHaveClass('badge-admin');
    });
  });

  test('displays correct role badge for Treasurer user', async () => {
    const mockUsers = {
      users: [
        {
          name: 'Jane Smith',
          email: 'jane@test.com',
          role: 'Treasurer',
          memberId: 'MEM002',
          joinDate: '2024-02-20T00:00:00.000Z'
        }
      ]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers
    });

    render(<ProfileTable />);

    await waitFor(() => {
      const treasurerBadge = screen.getByText('Treasurer');
      expect(treasurerBadge).toBeInTheDocument();
      expect(treasurerBadge).toHaveClass('badge-treasurer');
    });
  });

  test('displays correct role badge for Member user', async () => {
    const mockUsers = {
      users: [
        {
          name: 'Bob Johnson',
          email: 'bob@test.com',
          role: 'Member',
          memberId: 'MEM003',
          joinDate: '2024-03-10T00:00:00.000Z'
        }
      ]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers
    });

    render(<ProfileTable />);

    await waitFor(() => {
      const memberBadge = screen.getByText('Member');
      expect(memberBadge).toBeInTheDocument();
      expect(memberBadge).toHaveClass('badge-member');
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

  test('formats join date correctly', async () => {
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
      expect(screen.getByText('1/15/2024')).toBeInTheDocument();
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

  test('displays error message when fetch fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    fetch.mockResolvedValueOnce({
      ok: false
    });

    render(<ProfileTable />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load users')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  test('displays mock data when API returns error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    fetch.mockResolvedValueOnce({
      ok: false
    });

    render(<ProfileTable />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  test('displays mock data when network error occurs', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<ProfileTable />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@test.com')).toBeInTheDocument();
      expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  test('displays empty table when no users in response', async () => {
    const mockUsers = { users: [] };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers
    });

    render(<ProfileTable />);

    await waitFor(() => {
      expect(screen.getByText('No members found')).toBeInTheDocument();
    });
  });

  test('displays all users in the table', async () => {
    const mockUsers = {
      users: [
        {
          name: 'User One',
          email: 'user1@test.com',
          role: 'Member',
          memberId: 'MEM001',
          joinDate: '2024-01-01T00:00:00.000Z'
        },
        {
          name: 'User Two',
          email: 'user2@test.com',
          role: 'Member',
          memberId: 'MEM002',
          joinDate: '2024-01-02T00:00:00.000Z'
        },
        {
          name: 'User Three',
          email: 'user3@test.com',
          role: 'Member',
          memberId: 'MEM003',
          joinDate: '2024-01-03T00:00:00.000Z'
        }
      ]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers
    });

    render(<ProfileTable />);

    await waitFor(() => {
      expect(screen.getByText('User One')).toBeInTheDocument();
      expect(screen.getByText('User Two')).toBeInTheDocument();
      expect(screen.getByText('User Three')).toBeInTheDocument();
      expect(screen.getByText('user1@test.com')).toBeInTheDocument();
      expect(screen.getByText('user2@test.com')).toBeInTheDocument();
      expect(screen.getByText('user3@test.com')).toBeInTheDocument();
    });
  });

  test('displays table with correct number of rows', async () => {
    const mockUsers = {
      users: [
        {
          name: 'User One',
          email: 'user1@test.com',
          role: 'Member',
          memberId: 'MEM001',
          joinDate: '2024-01-01T00:00:00.000Z'
        },
        {
          name: 'User Two',
          email: 'user2@test.com',
          role: 'Member',
          memberId: 'MEM002',
          joinDate: '2024-01-02T00:00:00.000Z'
        }
      ]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers
    });

    render(<ProfileTable />);

    await waitFor(() => {
      const rows = document.querySelectorAll('tbody tr');
      expect(rows.length).toBe(2);
    });
  });

  test('displays user role with proper capitalization', async () => {
    const mockUsers = {
      users: [
        {
          name: 'Admin User',
          email: 'admin@test.com',
          role: 'Admin',
          memberId: 'MEM001',
          joinDate: '2024-01-01T00:00:00.000Z'
        },
        {
          name: 'Treasurer User',
          email: 'treasurer@test.com',
          role: 'Treasurer',
          memberId: 'MEM002',
          joinDate: '2024-01-02T00:00:00.000Z'
        },
        {
          name: 'Member User',
          email: 'member@test.com',
          role: 'Member',
          memberId: 'MEM003',
          joinDate: '2024-01-03T00:00:00.000Z'
        }
      ]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers
    });

    render(<ProfileTable />);

    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Treasurer')).toBeInTheDocument();
      expect(screen.getByText('Member')).toBeInTheDocument();
    });
  });

  test('displays email addresses correctly', async () => {
    const mockUsers = {
      users: [
        {
          name: 'Test User',
          email: 'test.email@domain.com',
          role: 'Member',
          memberId: 'MEM001',
          joinDate: '2024-01-01T00:00:00.000Z'
        }
      ]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers
    });

    render(<ProfileTable />);

    await waitFor(() => {
      expect(screen.getByText('test.email@domain.com')).toBeInTheDocument();
    });
  });

  test('handles users with missing name gracefully', async () => {
    const mockUsers = {
      users: [
        {
          name: null,
          email: 'user@test.com',
          role: 'Member',
          memberId: 'MEM001',
          joinDate: '2024-01-01T00:00:00.000Z'
        }
      ]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers
    });

    render(<ProfileTable />);

    await waitFor(() => {
      expect(screen.getByText('U')).toBeInTheDocument();
    });
  });

  test('handles users with empty name gracefully', async () => {
    const mockUsers = {
      users: [
        {
          name: '',
          email: 'user@test.com',
          role: 'Member',
          memberId: 'MEM001',
          joinDate: '2024-01-01T00:00:00.000Z'
        }
      ]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers
    });

    render(<ProfileTable />);

    await waitFor(() => {
      expect(screen.getByText('U')).toBeInTheDocument();
    });
  });

  test('displays member IDs correctly', async () => {
    const mockUsers = {
      users: [
        {
          name: 'Test User',
          email: 'user@test.com',
          role: 'Member',
          memberId: 'STK-2024-001',
          joinDate: '2024-01-01T00:00:00.000Z'
        }
      ]
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers
    });

    render(<ProfileTable />);

    await waitFor(() => {
      expect(screen.getByText('STK-2024-001')).toBeInTheDocument();
    });
  });
});
