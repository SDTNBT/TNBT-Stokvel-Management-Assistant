import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MemberDetails from '../Dashboard/MemberDetails';

const mockOnClose = jest.fn();
const mockOnRemove = jest.fn();

const mockMember = {
  _id: '2',
  fullName: 'Bob Mokoena',
  userEmail: 'bob@test.com',
  memberType: 'Member',
  joiningDate: '2026-04-18'
};

describe('MemberDetails Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders member details correctly', () => {
    render(
      <BrowserRouter>
        <MemberDetails member={mockMember} onClose={mockOnClose} onRemove={mockOnRemove} />
      </BrowserRouter>
    );
    
    
    const nameElements = screen.getAllByText(/Bob Mokoena/i);
    expect(nameElements.length).toBeGreaterThan(0);
    expect(nameElements[0]).toBeInTheDocument();
  });

  test('shows confirmation when Remove Member is clicked', () => {
    render(<MemberDetails member={mockMember} onClose={mockOnClose} onRemove={mockOnRemove} />);
    
    fireEvent.click(screen.getByText(/Remove Member/i));
    expect(screen.getByText(/Are you sure you want to remove this member\?/i)).toBeInTheDocument();
    
    fireEvent.click(screen.getByText(/No/i));
    expect(screen.queryByText(/Are you sure/i)).not.toBeInTheDocument();
  });

  test('handles successful removal', async () => {
    mockOnRemove.mockResolvedValue(true);
    render(<MemberDetails member={mockMember} onClose={mockOnClose} onRemove={mockOnRemove} />);
    
    fireEvent.click(screen.getByText(/Remove Member/i));
    fireEvent.click(screen.getByText(/Yes/i));

    
    const successMessage = await screen.findByText((content, element) => {
      return element.classList.contains('success-message') && 
             element.textContent.includes('successfully removed');
    });
    
    expect(successMessage).toBeInTheDocument();
    
    await waitFor(() => expect(mockOnClose).toHaveBeenCalled(), { timeout: 2500 });
  });

  test('handles failed removal', async () => {
    mockOnRemove.mockResolvedValue(false);
    render(<MemberDetails member={mockMember} onClose={mockOnClose} onRemove={mockOnRemove} />);
    
    fireEvent.click(screen.getByText(/Remove Member/i));
    fireEvent.click(screen.getByText(/Yes/i));

    const errorMessage = await screen.findByText(/Failed to remove member\./i);
    expect(errorMessage).toBeInTheDocument();
  });
  test('handles member without fullName (uses firstName/lastName)', () => {
    const partialMember = {
      firstName: 'Jane',
      lastName: 'Doe',
      memberType: 'Member'
    };
    render(<MemberDetails member={partialMember} onClose={mockOnClose} />);
    
    
    const nameElements = screen.getAllByText('Jane Doe');
    
    
    expect(nameElements).toHaveLength(2);
    expect(nameElements[0].tagName).toBe('H2');
    expect(nameElements[1].tagName).toBe('P');
  });

  test('displays error message correctly', async () => {
    
    mockOnRemove.mockResolvedValue(false);
    render(<MemberDetails member={mockMember} onClose={mockOnClose} onRemove={mockOnRemove} />);
    
    fireEvent.click(screen.getByText(/Remove Member/i));
    fireEvent.click(screen.getByText(/Yes/i));
    
    
    const errorElement = await screen.findByText(/Failed to remove member\./i);
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveClass('error-text');
  });
});