import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, Trash2, X, CheckCircle } from 'lucide-react';
import './Creategroup.css'; 

const CreateGroup = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    groupName: '',
    contributionAmount: '',
    frequency: 'Monthly',
    dueDate: '1',
    totalMembers: '',
    payoutMethod: 'EFT',
    duration: '',
    treasurer: {
      firstName: '',
      surname: '',
      email: ''
    }
  });

  const [members, setMembers] = useState([
    { id: Date.now(), firstName: '', surname: '', email: '' }
  ]);

  const [errors, setErrors] = useState({});
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [createdGroupName, setCreatedGroupName] = useState('');
  const [createdGroupId, setCreatedGroupId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loggedInUser = JSON.parse(sessionStorage.getItem('user')) || {};

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('treasurer.')) {
      const field = name.split('.')[1];
      setFormData({
        ...formData,
        treasurer: { ...formData.treasurer, [field]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleMemberChange = (id, e) => {
    const { name, value } = e.target;
    const newMembers = members.map(m => {
      if (m.id === id) return { ...m, [name]: value };
      return m;
    });
    setMembers(newMembers);
    
    if (errors[`member_${id}_email`]) {
      setErrors({ ...errors, [`member_${id}_email`]: null });
    }
  };

  const addMemberRow = () => {
    setMembers([...members, { id: Date.now(), firstName: '', surname: '', email: '' }]);
  };

  const removeMemberRow = (id) => {
    if (members.length > 1) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  const validateForm = () => {
    let tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.groupName.trim()) {
      tempErrors.groupName = "Group name is required";
    } else if (formData.groupName.length < 3) {
      tempErrors.groupName = "Group name must be at least 3 characters";
    }
    
    if (!formData.contributionAmount || formData.contributionAmount <= 0) {
      tempErrors.contributionAmount = "Valid contribution amount is required";
    } else if (formData.contributionAmount < 10) {
      tempErrors.contributionAmount = "Contribution amount must be at least R10";
    }
    
    if (!formData.treasurer.firstName.trim()) {
      tempErrors['treasurer.firstName'] = "First name is required";
    }
    
    if (!formData.treasurer.surname.trim()) {
      tempErrors['treasurer.surname'] = "Surname is required";
    }
    
    if (!formData.treasurer.email.trim()) {
      tempErrors['treasurer.email'] = "Email is required";
    } else if (!emailRegex.test(formData.treasurer.email)) {
      tempErrors['treasurer.email'] = "Valid email required";
    } else if (formData.treasurer.email.toLowerCase() === loggedInUser.email?.toLowerCase()) {
      tempErrors['treasurer.email'] = "Treasurer cannot be the same as the logged-in user";
    }

    const uniqueEmails = new Set();
    members.forEach((member) => {
      if (member.email && member.email.trim()) {
        const emailLower = member.email.toLowerCase();
        
        if (uniqueEmails.has(emailLower)) {
          tempErrors[`member_${member.id}_email`] = "Duplicate member email";
        }
        uniqueEmails.add(emailLower);
        
        if (!emailRegex.test(member.email)) {
          tempErrors[`member_${member.id}_email`] = "Valid email required";
        } else if (emailLower === loggedInUser.email?.toLowerCase()) {
          tempErrors[`member_${member.id}_email`] = "Cannot add yourself as a member";
        } else if (emailLower === formData.treasurer.email.toLowerCase()) {
          tempErrors[`member_${member.id}_email`] = "Member email cannot be same as Treasurer";
        }
      }
    });

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setIsSubmitting(true);

    const apiUrl = 'https://tnbt-stokvel-management-assistant.onrender.com/api';

    const payload = {
      groupName: formData.groupName.trim(),
      adminId: loggedInUser.email,
      treasurerId: formData.treasurer.email.trim(),
      treasurerDetails: {
        firstName: formData.treasurer.firstName.trim(),
        surname: formData.treasurer.surname.trim(),
        email: formData.treasurer.email.trim()
      },
      financials: {
        amount: Number(formData.contributionAmount),
        frequency: formData.frequency,
        duration: Number(formData.duration) || 12
      },
      members: members
        .filter(m => m.email && m.email.trim())
        .map(({ firstName, surname, email }) => ({ 
          firstName: firstName.trim(), 
          surname: surname.trim(), 
          email: email.trim() 
        }))
    };

    try {
      const response = await axios.post(`${apiUrl}/stokvel`, payload);
      
      if (response.status === 201 || response.status === 200) {
        setCreatedGroupName(formData.groupName);
        setCreatedGroupId(response.data.groupId || '');
        setShowSuccessPopup(true);
      } else {
        alert("Group created but there was an issue. Please check your dashboard.");
        navigate('/home', { state: { refresh: true } });
      }
    } catch (err) {
      console.error("Submission Error:", err);
      let errorMessage = "Error creating group. Please try again.";
      
      if (err.response?.data?.details) {
        errorMessage = err.response.data.details;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message === "Network Error") {
        errorMessage = "Network error. Please check your connection.";
      }
      
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClosePopup = () => {
    setShowSuccessPopup(false);
    navigate('/home', { state: { refresh: true, newGroup: createdGroupName } });
  };

  return (
    <section className="form-bg">
      <header className="create-header-nav">
        <button onClick={() => navigate(-1)} className="back-btn" aria-label="Go back">
          <ArrowLeft size={24} />
        </button>
        <h1>Create Group</h1>
        <span className="header-spacer" aria-hidden="true"></span> 
      </header>

      <main className="form-container">
        <form onSubmit={handleSubmit} className="semantic-form" noValidate>
          
          <fieldset className="form-section">
            <legend>Basic Information</legend>
            <p className="input-group">
              <label htmlFor="groupName">Group Name *</label>
              <input 
                id="groupName" 
                name="groupName" 
                type="text" 
                value={formData.groupName}
                onChange={handleChange} 
                className={errors.groupName ? 'input-error' : ''}
                placeholder="Enter group name"
                required
              />
              {errors.groupName && <span className="error-text">{errors.groupName}</span>}
            </p>

            <section className="form-row">
              <p className="input-group">
                <label htmlFor="contributionAmount">Contribution Amount (R) *</label>
                <input 
                  id="contributionAmount" 
                  name="contributionAmount" 
                  type="number" 
                  value={formData.contributionAmount} 
                  onChange={handleChange} 
                  className={errors.contributionAmount ? 'input-error' : ''}
                  placeholder="e.g., 500"
                  min="10"
                  required 
                />
                {errors.contributionAmount && <span className="error-text">{errors.contributionAmount}</span>}
              </p>
              <p className="input-group">
                <label htmlFor="frequency">Payment Frequency</label>
                <select id="frequency" name="frequency" value={formData.frequency} onChange={handleChange}>
                  <option value="Monthly">Monthly</option>
                  <option value="Weekly">Weekly</option>
                </select>
              </p>
            </section>
          </fieldset>

          <fieldset className="form-section">
            <legend>Logistics and Payout</legend>
            <section className="form-row">
              <p className="input-group">
                <label htmlFor="totalMembers">Total Members (Optional)</label>
                <input 
                  id="totalMembers" 
                  name="totalMembers" 
                  type="number" 
                  value={formData.totalMembers} 
                  onChange={handleChange}
                  placeholder="Estimated member count"
                  min="1"
                />
              </p>
              <p className="input-group">
                <label htmlFor="duration">Duration (Months)</label>
                <input 
                  id="duration" 
                  name="duration" 
                  type="number" 
                  value={formData.duration} 
                  onChange={handleChange} 
                  placeholder="e.g., 12"
                  min="1"
                />
              </p>
            </section>
          </fieldset>

          <fieldset className="form-section treasurer-section">
            <legend>Treasurer Information *</legend>
            <p className="section-note">The treasurer manages the group funds and payouts.</p>
            <section className="form-row triple-col">
              <p className="input-group">
                <label htmlFor="treasurerFirstName">First Name *</label>
                <input 
                  id="treasurerFirstName" 
                  name="treasurer.firstName" 
                  type="text" 
                  placeholder="First Name" 
                  value={formData.treasurer.firstName} 
                  onChange={handleChange} 
                  className={errors['treasurer.firstName'] ? 'input-error' : ''}
                  required 
                />
                {errors['treasurer.firstName'] && <span className="error-text">{errors['treasurer.firstName']}</span>}
              </p>
              <p className="input-group">
                <label htmlFor="treasurerSurname">Surname *</label>
                <input 
                  id="treasurerSurname" 
                  name="treasurer.surname" 
                  type="text" 
                  placeholder="Surname" 
                  value={formData.treasurer.surname} 
                  onChange={handleChange} 
                  className={errors['treasurer.surname'] ? 'input-error' : ''}
                  required 
                />
                {errors['treasurer.surname'] && <span className="error-text">{errors['treasurer.surname']}</span>}
              </p>
              <p className="input-group">
                <label htmlFor="treasurerEmail">Email Address *</label>
                <input 
                  id="treasurerEmail" 
                  name="treasurer.email" 
                  type="email" 
                  placeholder="treasurer@example.com" 
                  value={formData.treasurer.email} 
                  onChange={handleChange} 
                  className={errors['treasurer.email'] ? 'input-error' : ''}
                  required 
                />
                {errors['treasurer.email'] && <span className="error-text">{errors['treasurer.email']}</span>}
              </p>
            </section>
          </fieldset>

          <fieldset className="form-section">
            <legend>Add Members</legend>
            <p className="section-note">Add members to invite them to this group.</p>
            {members.map((member) => (
              <article key={member.id} className="form-row triple-col member-entry">
                <p className="input-group">
                  <label>Member Name</label>
                  <input 
                    name="firstName" 
                    placeholder="First Name" 
                    value={member.firstName} 
                    onChange={(e) => handleMemberChange(member.id, e)} 
                  />
                </p>
                <p className="input-group">
                  <label>Surname</label>
                  <input 
                    name="surname" 
                    placeholder="Surname" 
                    value={member.surname} 
                    onChange={(e) => handleMemberChange(member.id, e)} 
                  />
                </p>
                <p className="input-group">
                  <label>Email Address</label>
                  <span className="input-with-action">
                    <input 
                      name="email" 
                      type="email" 
                      placeholder="member@example.com" 
                      value={member.email} 
                      onChange={(e) => handleMemberChange(member.id, e)}
                      className={errors[`member_${member.id}_email`] ? 'input-error' : ''}
                    />
                    {members.length > 1 && (
                      <button type="button" onClick={() => removeMemberRow(member.id)} className="remove-row-btn" aria-label="Remove member">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </span>
                  {errors[`member_${member.id}_email`] && <span className="error-text">{errors[`member_${member.id}_email`]}</span>}
                </p>
              </article>
            ))}
            <button type="button" onClick={addMemberRow} className="add-row-btn">
              <Plus size={18} /> Add Another Member
            </button>
          </fieldset>

          <footer className="form-actions">
            <button type="submit" className="submit-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating Group...' : 'Create Group'}
            </button>
          </footer>
        </form>
      </main>

      {showSuccessPopup && (
        <aside className="success-popup-overlay" role="dialog" aria-modal="true">
          <article className="success-popup">
            <header className="success-popup-header">
              <button className="close-popup" onClick={handleClosePopup} aria-label="Close">
                <X size={24} />
              </button>
            </header>
            <section className="success-popup-content">
              <figure className="success-icon">
                <CheckCircle size={64} color="#10b981" />
              </figure>
              <h2>Group Created Successfully</h2>
              <p>Your group <strong>"{createdGroupName}"</strong> has been created.</p>
              <p>You can now view and manage it from your dashboard.</p>
              <button className="popup-action-btn" onClick={handleClosePopup}>
                Go to Dashboard
              </button>
            </section>
          </article>
        </aside>
      )}
    </section>
  );
};

export default CreateGroup;
