const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
   //'http://localhost:5000/api';
  'https://tnbt-stokvel-management-assistant.onrender.com/api';


// CREATE PAYOUT

export const schedulePayout = async (payoutData) => {
  const response = await fetch(`${API_BASE_URL}/payouts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-role': 'Treasurer'
    },
    body: JSON.stringify(payoutData)
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong scheduling the payout');
  }

  return data;
};


// GET MEMBER PAYOUT HISTORY

export const getMemberPayouts = async (email) => {
  try {
    const encodedEmail = encodeURIComponent(email);

    const response = await fetch(
      `${API_BASE_URL}/payouts/member/${encodedEmail}`
    );

    // Prevent HTML response crash
    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || 'Failed to fetch member payouts');
    }

    const data = await response.json();

    return data;

  } catch (error) {
    console.error('Error fetching member payouts:', error);
    throw error;
  }
};


// GET SCHEDULED PAYOUTS

export const getScheduledPayouts = async () => {
  const response = await fetch(`${API_BASE_URL}/payouts/scheduled`, {
    headers: {
      'x-user-role': 'Treasurer'
    }
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch scheduled payouts');
  }

  return data;
};


// UPDATE PAYOUT STATUS

export const updatePayoutStatus = async (payoutId, status) => {
  const response = await fetch(
    `${API_BASE_URL}/payouts/${payoutId}/status`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'Treasurer'
      },
      body: JSON.stringify({ status })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Failed to update payout status');
  }

  return data;
};