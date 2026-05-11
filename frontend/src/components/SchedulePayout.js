import React, { useState } from 'react';
import { schedulePayout } from '../services/payoutService';

const SchedulePayout = () => {
    const [formData, setFormData] = useState({
        groupName: '',
        userId: '',
        userEmail: '',
        amount: '',
        payoutDate: ''
    });
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const response = await schedulePayout(formData);
            setStatus({ type: 'success', message: response.message });
            setFormData({ groupName: '', userId: '', userEmail: '', amount: '', payoutDate: '' });
        } catch (error) {
            setStatus({ type: 'error', message: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section style={{ maxWidth: '400px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
            <header>
                <h2>Schedule a Payout</h2>
            </header>
            
            {status.message && (
                <output>
                    <p 
                        role="alert" 
                        style={{ 
                            padding: '10px', 
                            marginBottom: '15px', 
                            borderRadius: '4px',
                            backgroundColor: status.type === 'error' ? '#ffebee' : '#e8f5e9',
                            color: status.type === 'error' ? '#c62828' : '#2e7d32',
                            border: `1px solid ${status.type === 'error' ? '#ef9a9a' : '#a5d6a7'}`,
                            margin: '0 0 15px 0'
                        }}
                    >
                        {status.message}
                    </p>
                </output>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <fieldset style={{ border: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontWeight: 'bold' }}>
                        Group Name
                        <input 
                            type="text" 
                            name="groupName" 
                            placeholder="e.g. TEST003" 
                            value={formData.groupName} 
                            onChange={handleChange} 
                            required 
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontWeight: 'normal' }}
                        />
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontWeight: 'bold' }}>
                        Member ID
                        <input 
                            type="text" 
                            name="userId" 
                            placeholder="Enter unique ID" 
                            value={formData.userId} 
                            onChange={handleChange} 
                            required 
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontWeight: 'normal' }}
                        />
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontWeight: 'bold' }}>
                        Member Email
                        <input 
                            type="email" 
                            name="userEmail" 
                            placeholder="member@students.wits.ac.za" 
                            value={formData.userEmail} 
                            onChange={handleChange} 
                            required 
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontWeight: 'normal' }}
                        />
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontWeight: 'bold' }}>
                        Amount (ZAR)
                        <input 
                            type="number" 
                            name="amount" 
                            placeholder="e.g. 500" 
                            value={formData.amount} 
                            onChange={handleChange} 
                            required 
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontWeight: 'normal' }}
                        />
                    </label>

                    <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontWeight: 'bold' }}>
                        Payout Date
                        <input 
                            type="date" 
                            name="payoutDate" 
                            value={formData.payoutDate} 
                            onChange={handleChange} 
                            required 
                            style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', fontWeight: 'normal' }}
                        />
                    </label>

                </fieldset>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    style={{ 
                        padding: '10px', 
                        backgroundColor: isLoading ? '#9e9e9e' : '#1976d2', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        marginTop: '10px'
                    }}
                >
                    {isLoading ? 'Scheduling...' : 'Schedule Payout'}
                </button>
            </form>
        </section>
    );
};

export default SchedulePayout;