import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    });

    test('shows confirmation when Remove Member is clicked', () => {
        render(
            <MemberDetails member={mockMember} onClose={mockOnClose} onRemove={mockOnRemove} />
        );

        fireEvent.click(screen.getByText(/Remove Member/i));
        expect(screen.getByText(/Are you sure you want to remove this member\?/i)).toBeInTheDocument();

        fireEvent.click(screen.getByText(/No/i));
        expect(screen.queryByText(/Are you sure/i)).not.toBeInTheDocument();
    });

    test('handles successful removal', async () => {
        mockOnRemove.mockResolvedValue(true);
        render(
            <MemberDetails member={mockMember} onClose={mockOnClose} onRemove={mockOnRemove} />
        );

        fireEvent.click(screen.getByText(/Remove Member/i));
        fireEvent.click(screen.getByText(/Yes/i));

        // Look for any success indicator
        await waitFor(() => {
            const successEl = document.querySelector('.success-message');
            const successText = screen.queryByText(/successfully removed|removed successfully/i);
            expect(successEl || successText).toBeTruthy();
        }, { timeout: 3000 });

        await waitFor(() => expect(mockOnClose).toHaveBeenCalled(), { timeout: 3000 });
    });

    test('handles failed removal', async () => {
        mockOnRemove.mockResolvedValue(false);
        render(
            <MemberDetails member={mockMember} onClose={mockOnClose} onRemove={mockOnRemove} />
        );

        fireEvent.click(screen.getByText(/Remove Member/i));
        fireEvent.click(screen.getByText(/Yes/i));

        await waitFor(() => {
            const errorEl = document.querySelector('.error-text');
            const errorText = screen.queryByText(/Failed to remove/i);
            expect(errorEl || errorText).toBeTruthy();
        }, { timeout: 3000 });
    });

    test('handles member without fullName using firstName/lastName', () => {
        const partialMember = {
            firstName: 'Jane',
            lastName: 'Doe',
            memberType: 'Member'
        };
        render(
            <MemberDetails member={partialMember} onClose={mockOnClose} onRemove={mockOnRemove} />
        );

        const nameElements = screen.getAllByText(/Jane Doe/i);
        expect(nameElements.length).toBeGreaterThan(0);
    });
});