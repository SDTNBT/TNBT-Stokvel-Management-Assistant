import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 

const MemberAnalytics = () => {
    const [summary, setSummary] = useState({ totalContributions: 0, totalPayouts: 0 });
    const [transactions, setTransactions] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    // Helper to grab the user ID exactly how the rest of your dashboard does
    const getUserId = () => {
        const sessionUser = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');
        return sessionUser._id || sessionUser.id || '';
    };

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const userToken = localStorage.getItem('token');
            const userId = getUserId(); // 1. Get the ID

            const response = await axios.get(`${API_BASE_URL}/analytics/member`, {
                params: { startDate, endDate },
                headers: { 
                    'Authorization': `Bearer ${userToken}`,
                    'x-user-id': userId // 2. Send the ID to bypass the 401 Unauthorized!
                }
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
            const userToken = localStorage.getItem('token');
            const userId = getUserId(); // 1. Get the ID

            const response = await axios.get(`${API_BASE_URL}/analytics/member`, {
                params: { startDate, endDate, format: 'csv' },
                headers: { 
                    'Authorization': `Bearer ${userToken}`,
                    'x-user-id': userId // 2. Send the ID here too!
                },
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

    const handleExportPDF = () => {
        const doc = new jsPDF();
        
        // Add Title and Summary info to the top of the PDF
        doc.setFontSize(18);
        doc.text("My Financial Analytics - [StokvelStokkie Pty Ltd]", 14, 22);
        
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Total Contributions: R ${summary.totalContributions.toLocaleString()}`, 14, 30);
        
        // Define the table columns and map the data into rows
        const tableColumn = ["Date", "Transaction ID", "Amount"];
        const tableRows = [];

        transactions.forEach(transaction => {
            const transactionData = [
                new Date(transaction.date).toLocaleDateString(),
                transaction.transactionId,
                `R ${transaction.amount.toLocaleString()}`
            ];
            tableRows.push(transactionData);
        });

        // Generate the table
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 35,
            theme: 'striped',
            styles: { fontSize: 10 }
        });

        // Trigger the download
        doc.save("my_financial_records.pdf");
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
            <menu className="dashboard-actions" style={{ display: 'flex', gap: '15px', margin: '20px 0', padding: 0 }}>
                <button 
                    type="button" 
                    onClick={handleExportCSV} 
                    style={{ padding: '10px 15px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Download CSV
                </button>
                
                <button 
                    type="button" 
                    onClick={handleExportPDF} 
                    style={{ padding: '10px 15px', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    Download PDF
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