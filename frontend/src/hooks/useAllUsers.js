import { useState, useEffect } from 'react';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const useAllUsers = () => {
  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${apiUrl}/users/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const data = await res.json();
        
        // Let's add a quick console log so you can see exactly what the backend sent!
        console.log("Backend response for users:", data);

        // NEW LOGIC: Check if it's an array directly, OR if the array is hiding inside data.users or data.data
        if (Array.isArray(data)) {
          setUsers(data);
        } else if (data && Array.isArray(data.users)) {
          setUsers(data.users);
        } else if (data && Array.isArray(data.data)) {
          setUsers(data.data);
        } else {
          console.error("Could not find an array of users in the response!");
        }
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return { users, loading, error };
};