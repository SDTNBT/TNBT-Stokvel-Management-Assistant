import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './MemberAnalytics.css'; 

const MemberAnalytics = () => {
    const [summary, setSummary] = useState({ totalContributions: 0, totalPayouts: 0 });
    const [transactions, setTransactions] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/analytics/member`, {
                params: { startDate, endDate },
                headers: { 'x-user-id': 'test-user-123' } // Replace with real auth token later!
            });
            
            setSummary(response.data.summary);
            setTransactions(response.data.transactions);
        } catch (error) {
            console.error("Failed to fetch analytics:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const handleExportCSV = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/analytics/member`, {
                params: { startDate, endDate, format: 'csv' },
                headers: { 'x-user-id': 'test-user-123' },
                responseType: 'blob', 
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'my_financial_records.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Failed to download CSV:", error);
        }
    };

    return (
        <section className="analytics-dashboard">
            <header>
                <h2>My Financial Analytics</h2>
            </header>

            {/* --- FILTER CONTROLS --- */}
            <form className="filter-controls" onSubmit={(e) => { e.preventDefault(); fetchAnalytics(); }}>
                <fieldset>
                    <legend>Filter by Date</legend>
                    <label>
                        Start Date:
                        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    </label>
                    <label>
                        End Date:
                        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                    </label>
                    <button type="submit">Apply Filter</button>
                    <button type="reset" onClick={() => { setStartDate(''); setEndDate(''); fetchAnalytics(); }}>
                        Clear
                    </button>
                </fieldset>
            </form>

            {/* --- SUMMARY CARDS --- */}
            <article className="summary-cards">
                <header>
                    <h3>Total Contributions</h3>
                </header>
                <output>R {summary.totalContributions.toLocaleString()}</output>
            </article>

            {/* --- ACTIONS / EXPORT --- */}
            <menu className="dashboard-actions">
                <button type="button" onClick={handleExportCSV}>
                    📥 Download CSV Records
                </button>
            </menu>

            {/* --- TRANSACTIONS TABLE --- */}
            <section className="transactions-data">
                {loading ? <p>Loading data...</p> : (
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Transaction ID</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.length > 0 ? transactions.map((t) => (
                                <tr key={t._id}>
                                    <td>{new Date(t.date).toLocaleDateString()}</td>
                                    <td>{t.transactionId}</td>
                                    <td>R {t.amount.toLocaleString()}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="3">No transactions found for this period.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </section>
        </section>
    );
};

export default MemberAnalytics;