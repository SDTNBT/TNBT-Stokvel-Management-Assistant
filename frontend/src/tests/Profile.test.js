import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Profile from '../components/Profile';

// Mock fetch
global.fetch = jest.fn();

// Mock sessionStorage
const mockUser = {
  name: 'Kagiso',
  surname: 'Kotu',
  email: 'kagisokotu20@gmail.com',
  role: 'Member',
  createdAt: '2026-01-15T00:00:00.000Z',
  _id: 'user123'
};

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

beforeEach(() => {
  jest.clearAllMocks();
  Storage.prototype.getItem = jest.fn(() => JSON.stringify(mockUser));
  Storage.prototype.setItem = jest.fn();
});

afterEach(() => {
  jest.resetAllMocks();
});

const renderWithRouter = (component) => {
  return render(component, { wrapper: BrowserRouter });
};

describe('Profile Component', () => {

  test('renders loading state initially', () => {
    fetch.mockImplementationOnce(() => new Promise(() => {}));
    
    renderWithRouter(<Profile user={mockUser} onLogout={() => {}} />);
    
    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
  });

  test('displays user profile information correctly', async () => {
    const mockUserData = {
      user: {
        name: 'Kagiso',
        surname: 'Kotu',
        email: 'kagisokotu20@gmail.com',
        role: 'Member',
        createdAt: '2026-01-15T00:00:00.000Z'
      }
    };

    const mockGroups = [];

    fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGroups)
      }));

    renderWithRouter(<Profile user={mockUser} onLogout={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Kagiso Kotu')).toBeInTheDocument();
      expect(screen.getByText('kagisokotu20@gmail.com')).toBeInTheDocument();
      expect(screen.getByText('Kagiso')).toBeInTheDocument();
      expect(screen.getByText('Kotu')).toBeInTheDocument();
      expect(screen.getByText('Member')).toBeInTheDocument();
    });
  });

  test('displays Account Information section', async () => {
    const mockUserData = {
      user: {
        name: 'Kagiso',
        surname: 'Kotu',
        email: 'kagisokotu20@gmail.com',
        role: 'Member',
        createdAt: '2026-01-15T00:00:00.000Z'
      }
    };
    const mockGroups = [];

    fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGroups)
      }));

    renderWithRouter(<Profile user={mockUser} onLogout={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Account Information')).toBeInTheDocument();
      expect(screen.getByText('First Name')).toBeInTheDocument();
      expect(screen.getByText('Last Name / Surname')).toBeInTheDocument();
      expect(screen.getByText('Full Name')).toBeInTheDocument();
      expect(screen.getByText('Email Address')).toBeInTheDocument();
    });
  });

  test('displays Stokvel Information section', async () => {
    const mockUserData = {
      user: {
        name: 'Kagiso',
        surname: 'Kotu',
        email: 'kagisokotu20@gmail.com',
        role: 'Member',
        createdAt: '2026-01-15T00:00:00.000Z'
      }
    };
    const mockGroups = [];

    fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGroups)
      }));

    renderWithRouter(<Profile user={mockUser} onLogout={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Stokvel Information')).toBeInTheDocument();
      expect(screen.getByText('Account Created')).toBeInTheDocument();
      expect(screen.getByText('Account Status')).toBeInTheDocument();
    });
  });

  test('displays My Groups section', async () => {
    const mockUserData = {
      user: {
        name: 'Kagiso',
        surname: 'Kotu',
        email: 'kagisokotu20@gmail.com',
        role: 'Member',
        createdAt: '2026-01-15T00:00:00.000Z'
      }
    };
    const mockGroups = [];

    fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGroups)
      }));

    renderWithRouter(<Profile user={mockUser} onLogout={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('My Groups')).toBeInTheDocument();
    });
  });

  test('displays user groups when user belongs to groups', async () => {
    const mockUserData = {
      user: {
        name: 'Kagiso',
        surname: 'Kotu',
        email: 'kagisokotu20@gmail.com',
        role: 'Admin',
        createdAt: '2026-01-15T00:00:00.000Z'
      }
    };
    const mockGroups = [
      {
        _id: 'group1',
        groupName: 'Family Savings',
        userRole: 'Admin',
        frequency: 'Monthly',
        contributionAmount: 1000
      },
      {
        _id: 'group2',
        groupName: 'Investment Club',
        userRole: 'Member',
        frequency: 'Monthly',
        contributionAmount: 500
      }
    ];

    fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGroups)
      }));

    renderWithRouter(<Profile user={mockUser} onLogout={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Family Savings')).toBeInTheDocument();
      expect(screen.getByText('Investment Club')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Member')).toBeInTheDocument();
      expect(screen.getByText('Monthly • R1000')).toBeInTheDocument();
      expect(screen.getByText('Monthly • R500')).toBeInTheDocument();
    });
  });

  test('displays no groups message when user has no groups', async () => {
    const mockUserData = {
      user: {
        name: 'Kagiso',
        surname: 'Kotu',
        email: 'kagisokotu20@gmail.com',
        role: 'Member',
        createdAt: '2026-01-15T00:00:00.000Z'
      }
    };
    const mockGroups = [];

    fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGroups)
      }));

    renderWithRouter(<Profile user={mockUser} onLogout={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('You are not a member of any group yet.')).toBeInTheDocument();
    });
  });

  test('displays account status as Active when user has groups', async () => {
    const mockUserData = {
      user: {
        name: 'Kagiso',
        surname: 'Kotu',
        email: 'kagisokotu20@gmail.com',
        role: 'Admin',
        createdAt: '2026-01-15T00:00:00.000Z'
      }
    };
    const mockGroups = [
      {
        _id: 'group1',
        groupName: 'Family Savings',
        userRole: 'Admin',
        frequency: 'Monthly',
        contributionAmount: 1000
      }
    ];

    fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGroups)
      }));

    renderWithRouter(<Profile user={mockUser} onLogout={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Active')).toBeInTheDocument();
    });
  });

  test('displays account status as Inactive when user has no groups', async () => {
    const mockUserData = {
      user: {
        name: 'Kagiso',
        surname: 'Kotu',
        email: 'kagisokotu20@gmail.com',
        role: 'Member',
        createdAt: '2026-01-15T00:00:00.000Z'
      }
    };
    const mockGroups = [];

    fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGroups)
      }));

    renderWithRouter(<Profile user={mockUser} onLogout={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Inactive')).toBeInTheDocument();
    });
  });

  test('displays correct role badge for Admin user', async () => {
    const mockUserData = {
      user: {
        name: 'Kagiso',
        surname: 'Kotu',
        email: 'kagisokotu20@gmail.com',
        role: 'Admin',
        createdAt: '2026-01-15T00:00:00.000Z'
      }
    };
    const mockGroups = [];

    fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGroups)
      }));

    renderWithRouter(<Profile user={mockUser} onLogout={() => {}} />);

    await waitFor(() => {
      const roleBadge = screen.getByText('Admin');
      expect(roleBadge).toHaveClass('role-admin');
    });
  });

  test('displays correct role badge for Treasurer user', async () => {
    const mockUserData = {
      user: {
        name: 'Kagiso',
        surname: 'Kotu',
        email: 'kagisokotu20@gmail.com',
        role: 'Treasurer',
        createdAt: '2026-01-15T00:00:00.000Z'
      }
    };
    const mockGroups = [];

    fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGroups)
      }));

    renderWithRouter(<Profile user={mockUser} onLogout={() => {}} />);

    await waitFor(() => {
      const roleBadge = screen.getByText('Treasurer');
      expect(roleBadge).toHaveClass('role-treasurer');
    });
  });

  test('displays correct role badge for Member user', async () => {
    const mockUserData = {
      user: {
        name: 'Kagiso',
        surname: 'Kotu',
        email: 'kagisokotu20@gmail.com',
        role: 'Member',
        createdAt: '2026-01-15T00:00:00.000Z'
      }
    };
    const mockGroups = [];

    fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGroups)
      }));

    renderWithRouter(<Profile user={mockUser} onLogout={() => {}} />);

    await waitFor(() => {
      const roleBadge = screen.getByText('Member');
      expect(roleBadge).toHaveClass('role-member');
    });
  });

  test('navigates back when back button is clicked', async () => {
    const mockUserData = {
      user: {
        name: 'Kagiso',
        surname: 'Kotu',
        email: 'kagisokotu20@gmail.com',
        role: 'Member',
        createdAt: '2026-01-15T00:00:00.000Z'
      }
    };
    const mockGroups = [];

    fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGroups)
      }));

    renderWithRouter(<Profile user={mockUser} onLogout={() => {}} />);

    await waitFor(() => {
      expect(screen.getByLabelText('Go back')).toBeInTheDocument();
    });

    const backButton = screen.getByLabelText('Go back');
    fireEvent.click(backButton);

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  test('calls onLogout when logout button is clicked', async () => {
    const mockUserData = {
      user: {
        name: 'Kagiso',
        surname: 'Kotu',
        email: 'kagisokotu20@gmail.com',
        role: 'Member',
        createdAt: '2026-01-15T00:00:00.000Z'
      }
    };
    const mockGroups = [];
    const mockOnLogout = jest.fn();

    fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGroups)
      }));

    renderWithRouter(<Profile user={mockUser} onLogout={mockOnLogout} />);

    await waitFor(() => {
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    expect(mockOnLogout).toHaveBeenCalled();
  });

  test('displays full name correctly (First Name + Last Name)', async () => {
    const mockUserData = {
      user: {
        name: 'Kagiso',
        surname: 'Kotu',
        email: 'kagisokotu20@gmail.com',
        role: 'Member',
        createdAt: '2026-01-15T00:00:00.000Z'
      }
    };
    const mockGroups = [];

    fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGroups)
      }));

    renderWithRouter(<Profile user={mockUser} onLogout={() => {}} />);

    await waitFor(() => {
      const fullName = screen.getByText('Kagiso Kotu');
      expect(fullName).toBeInTheDocument();
    });
  });

  test('displays avatar with first letter of full name', async () => {
    const mockUserData = {
      user: {
        name: 'Kagiso',
        surname: 'Kotu',
        email: 'kagisokotu20@gmail.com',
        role: 'Member',
        createdAt: '2026-01-15T00:00:00.000Z'
      }
    };
    const mockGroups = [];

    fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGroups)
      }));

    renderWithRouter(<Profile user={mockUser} onLogout={() => {}} />);

    await waitFor(() => {
      const avatar = screen.getByLabelText('Profile initial');
      expect(avatar).toHaveTextContent('K');
    });
  });

  test('displays "Not set" for missing profile fields', async () => {
    const incompleteUser = {
      name: '',
      surname: '',
      email: '',
      role: 'Member',
      createdAt: '2026-01-15T00:00:00.000Z'
    };

    const mockUserData = {
      user: incompleteUser
    };
    const mockGroups = [];

    fetch
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockUserData)
      }))
      .mockImplementationOnce(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockGroups)
      }));

    renderWithRouter(<Profile user={incompleteUser} onLogout={() => {}} />);

    await waitFor(() => {
      const notSetFields = screen.getAllByText('Not set');
      expect(notSetFields.length).toBeGreaterThan(0);
    });
  });

  test('handles API error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    fetch.mockRejectedValueOnce(new Error('Network error'));

    renderWithRouter(<Profile user={mockUser} onLogout={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Loading profile...')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  test('uses sessionStorage data when API fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    fetch.mockRejectedValueOnce(new Error('Network error'));

    renderWithRouter(<Profile user={mockUser} onLogout={() => {}} />);

    await waitFor(() => {
      expect(screen.getByText('Kagiso Kotu')).toBeInTheDocument();
      expect(screen.getByText('kagisokotu20@gmail.com')).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });
});
