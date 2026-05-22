import { render, screen, fireEvent } from '@testing-library/react';
import ViewBankingDetails from '../components/ViewBankingDetails';

describe('ViewBankingDetails Component', () => {
  const mockBankData = {
    bankName: 'FNB',
    accountNumber: '1234567890'
  };

  it('renders correctly when bankData exists', () => {
    const mockOnEdit = jest.fn();
    const mockOnBack = jest.fn();
    
    render(
      <ViewBankingDetails 
        bankData={mockBankData} 
        onEdit={mockOnEdit} 
        onBack={mockOnBack} 
      />
    );
    
    // Verify content
    expect(screen.getByText('FNB')).toBeInTheDocument();
    
    // Verify masking
    const maskedNumberElement = screen.getByText((content, element) => {
      return element.tagName.toLowerCase() === 'strong' && content.includes('7890');
    });
    expect(maskedNumberElement).toBeInTheDocument();

    // Verify interactions
    fireEvent.click(screen.getByText(/back to menu/i));
    expect(mockOnBack).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: /edit banking details/i }));
    expect(mockOnEdit).toHaveBeenCalled();
  });

  it('renders "No Details Found" when bankData is null', () => {
    const mockOnEdit = jest.fn();
    render(<ViewBankingDetails bankData={null} onEdit={mockOnEdit} onBack={jest.fn()} />);
    
    // Verify "No Details Found" view (This covers lines 45-53)
    expect(screen.getByText(/No Details Found/i)).toBeInTheDocument();
    
    // Verify button in the empty state
    const addButton = screen.getByRole('button', { name: /add details/i });
    fireEvent.click(addButton);
    expect(mockOnEdit).toHaveBeenCalled();
  });
});