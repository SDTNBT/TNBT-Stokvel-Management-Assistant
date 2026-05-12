import React, { useEffect, useState } from 'react';

const SavingsProjection = () => {
  const [rates, setRates] = useState(null);
  const [amount, setAmount] = useState(300);
  const [months, setMonths] = useState(12);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch('https://tnbt-stokvel-management-assistant.onrender.com/api/rates');
        //const res = await fetch('http://localhost:5000/api/rates');

        if (!res.ok) {
          throw new Error('Could not load rate data');
        }

        const data = await res.json();
        setRates(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchRates();
  }, []);

  const calculateProjection = () => {
    if (!rates) return 0;

    const monthlyRate = rates.primeRate / 100 / 12;
    const projected = amount * Math.pow(1 + monthlyRate, months);

    return projected.toFixed(2);
  };

  return (
    <section style={{
      background: '#ffffff',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      marginTop: '20px'
    }}>
      <h2 style={{ marginTop: 0 }}>SA Rates & Savings Projection</h2>

      {error && !rates && (
  <p style={{ color: 'red' }}>
    {error}
  </p>
)}

      {rates ? (
        <>
          <section style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <article style={cardStyle}>
              <strong>Prime Lending Rate</strong>
              <p style={rateStyle}>{rates.primeRate}%</p>
            </article>

            <article style={cardStyle}>
              <strong>SARB Policy / Repo Rate</strong>
              <p style={rateStyle}>{rates.repoRate}%</p>
            </article>

            <article style={cardStyle}>
              <strong>Last Updated</strong>
              <p>{rates.lastUpdated}</p>
            </article>
          </section>

          <section style={{ marginBottom: '16px' }}>
            <label>
              Savings / Contribution Amount:
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                style={inputStyle}
              />
            </label>
          </section>

          <section style={{ marginBottom: '16px' }}>
            <label>
              Projection Period in Months:
              <input
                type="number"
                value={months}
                onChange={(e) => setMonths(Number(e.target.value))}
                style={inputStyle}
              />
            </label>
          </section>

          <article style={{
            background: '#f0f7f4',
            padding: '16px',
            borderRadius: '10px',
            borderLeft: '4px solid #007f62'
          }}>
            <strong>Projected Savings Value</strong>
            <p style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#005b43',
              margin: '8px 0 0'
            }}>
              R {calculateProjection()}
            </p>
          </article>

          <p style={{ fontSize: '12px', color: '#666', marginTop: '14px' }}>
            Source: {rates.source}. This projection is an estimate based on the displayed prime lending rate.
          </p>
        </>
      ) : (
        <p>Loading rate data...</p>
      )}
    </section>
  );
};

const cardStyle = {
  background: '#f8fbff',
  padding: '14px',
  borderRadius: '10px',
  border: '1px solid #e5e7eb'
};

const rateStyle = {
  fontSize: '24px',
  fontWeight: '700',
  margin: '8px 0 0',
  color: '#005b43'
};

const inputStyle = {
  display: 'block',
  width: '100%',
  maxWidth: '300px',
  padding: '10px',
  marginTop: '6px',
  borderRadius: '6px',
  border: '1px solid #ccc'
};

export default SavingsProjection;
