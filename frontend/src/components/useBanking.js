import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { auth } from '../services/firebase';

export const useBanking = (userEmail) => {
  const [bankingView, setBankingView] = useState('menu');
  const [hasBankingDetails, setHasBankingDetails] = useState(false);
  const [bankData, setBankData] = useState(null);
  const [showEmptyWarning, setShowEmptyWarning] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchBankingStatus = useCallback(async (user) => {
    // 1. Check for user immediately
    const currentUser = user || auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true); 
      const token = await currentUser.getIdToken(true);
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

      const response = await axios.get(`${API_BASE_URL}/banking/my-details`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // 2. Consistent Data Check
      if (response.data && response.data.success && response.data.data) {
        setHasBankingDetails(true);
        setBankData(response.data.data);
      } else {
        setHasBankingDetails(false);
        setBankData(null);
      }
    } catch (err) {
      console.error("Error fetching bank status", err);
      setHasBankingDetails(false);
      setBankData(null);
    } finally {
      // 3. This MUST run to stop the loading state in tests
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onIdTokenChanged((user) => {
      if (user) {
        fetchBankingStatus(user);
      } else {
        setLoading(false);
      }
    });

    // Safety check: only return a function if unsubscribe is actually a function
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [fetchBankingStatus]);

  const handleViewDetails = () => {
    if (loading) return;
    setBankingView('view'); 
    setShowEmptyWarning(false);
  };

  const navigateToForm = () => {
    setShowEmptyWarning(false);
    setBankingView('form');
  };
  
  const navigateToMenu = () => {
    setBankingView('menu');
    // Ensure we pass a user if calling manually, or let it fallback to auth.currentUser
    fetchBankingStatus(); 
  };

  return {
    bankingView,
    hasBankingDetails,
    bankData,
    showEmptyWarning,
    handleViewDetails,
    navigateToForm,
    navigateToMenu,
    isLoading: loading 
  };
};