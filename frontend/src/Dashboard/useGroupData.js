import { useState, useEffect } from 'react';

export const useGroupData = (groupId) => {
  const API_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : 'https://tnbt-stokvel-management-assistant.onrender.com';
  const [members, setMembers] = useState([]);
  const [group, setGroup] = useState(null);

  const fetchGroupData = async () => {
    if (!groupId) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/managegroup/${groupId}/members`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
        setGroup(data.group || null);
      }
    } catch (err) {
      console.error("Error fetching group data:", err);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [groupId]);

  return { members, group, setMembers, refetch: fetchGroupData };
};