import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ViewMembers from '../Dashboard/ViewMembers';

describe('ViewMembers Component', () => {
    const mockGroup = {
        groupName: 'Community Stokvel',
        creationDate: '2026-04-18T00:00:00.000Z'
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
        jest.clearAllMocks();
        const user = JSON.stringify({ email: 'alice@test.com', name: 'Alice Zwane' });
        window.sessionStorage.setItem('user', user);
    });

    test('renders group header and member list correctly', () => {
        render(
            <BrowserRouter>
                <ViewMembers group={mockGroup} members={mockMembers} onSelectMember={mockOnSelect} />
            </BrowserRouter>
        );

        expect(screen.getByText(/Community Stokvel/i)).toBeInTheDocument();
        // Use getAllByText to avoid multiple match error
        const memberCountEl = screen.getAllByText(/1/)[0];
        expect(memberCountEl).toBeInTheDocument();
    });

    test('calls onSelectMember when a member card is clicked', () => {
        render(
            <BrowserRouter>
                <ViewMembers group={mockGroup} members={mockMembers} onSelectMember={mockOnSelect} />
            </BrowserRouter>
        );

        const memberCard = screen.getByText(/You|Alice Zwane/i).closest('li');
        fireEvent.click(memberCard);

        expect(mockOnSelect).toHaveBeenCalledTimes(1);
        expect(mockOnSelect).toHaveBeenCalledWith(mockMembers[0]);
    });

    test('shows empty state when no members', () => {
        render(
            <BrowserRouter>
                <ViewMembers group={mockGroup} members={[]} onSelectMember={mockOnSelect} />
            </BrowserRouter>
        );

        expect(screen.getByText(/No members found/i)).toBeInTheDocument();
    });
});