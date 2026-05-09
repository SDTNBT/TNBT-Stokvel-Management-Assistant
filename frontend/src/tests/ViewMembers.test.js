import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ViewMembers from '../Dashboard/ViewMembers'; 

describe('ViewMembers Component', () => {
    const mockGroup = { 
        groupName: "Community Stokvel", 
        creationDate: "2026-04-18T00:00:00.000Z" 
    };

    const mockMembers = [
        { 
            _id: '1', 
            displayName: 'Alice Zwane', 
            userEmail: 'alice@test.com', 
            memberType: 'Admin',
            joiningDate: '2026-04-18'
        }
    ];

    const mockOnSelect = jest.fn();

    beforeEach(() => {
        
        const user = JSON.stringify({ email: 'alice@test.com', name: 'Alice Zwane' });
        window.sessionStorage.setItem('user', user);
    });

    test('renders group header, creation date, and member list correctly', () => {
        render(
            <BrowserRouter>
                <ViewMembers group={mockGroup} members={mockMembers} onSelectMember={mockOnSelect} />
            </BrowserRouter>
        );

        
        expect(screen.getByText(/Community Stokvel/i)).toBeInTheDocument();
        expect(screen.getByText(/Created: 18 April 2026/i)).toBeInTheDocument();

        
        expect(screen.getByText(/Members/i)).toBeInTheDocument();
        expect(screen.getByText('1')).toBeInTheDocument();
    });

    test('calls onSelectMember when a member card is clicked', () => {
        render(
            <BrowserRouter>
                <ViewMembers group={mockGroup} members={mockMembers} onSelectMember={mockOnSelect} />
            </BrowserRouter>
        );

        
        const memberCard = screen.getByText(/You/i).closest('li');
        fireEvent.click(memberCard);

        expect(mockOnSelect).toHaveBeenCalledTimes(1);
        expect(mockOnSelect).toHaveBeenCalledWith(mockMembers[0]);
    });
});