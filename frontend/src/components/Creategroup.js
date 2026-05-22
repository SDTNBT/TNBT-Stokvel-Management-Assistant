import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Plus, Trash2, Users, CreditCard, Calendar, UserPlus, ShieldCheck } from 'lucide-react';
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
    payoutOrder: '',
    meetingFrequency: '',
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

    if (!formData.payoutOrder) {
      tempErrors.payoutOrder = "Payout order is required";
    } else if (formData.payoutOrder < 1 || formData.payoutOrder > 31) {
      tempErrors.payoutOrder = "Must be between 1 and 31";
    }

    if (!formData.meetingFrequency) {
      tempErrors.meetingFrequency = "Meeting frequency is required";
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

  const goToHome = (groupName) => {
    navigate('/home', { 
      state: { 
        refresh: true, 
        newGroup: groupName
      } 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = document.querySelector('.input-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
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
        duration: Number(formData.duration) || 12,
        payoutOrder: formData.payoutOrder,
        meetingFrequency: formData.meetingFrequency
      },
      members: members
        .filter(m => m.email && m.email.trim())
        .map(({ firstName, surname, email }) => ({
          firstName: firstName.trim(),
          surname: surname.trim(),
          email: email.trim()
        }))
    };

    // Show success message and redirect
    alert("Group created successfully!");
    goToHome(formData.groupName);

    // Send API request in background
    axios.post(`${apiUrl}/stokvel`, payload, {
      timeout: 30000
    }).catch(err => {
      console.error("Background submission error:", err);
    });
  };

  return (
    <main className="form-bg">
      <header className="create-header-nav">
        <button onClick={() => navigate(-1)} className="back-btn" aria-label="Go back">
          <ArrowLeft size={24} />
        </button>
        <h1>Create Group</h1>
        <output className="header-spacer" aria-hidden="true"></output>
      </header>

      <section className="form-container">
        <form onSubmit={handleSubmit} className="semantic-form" noValidate>
          
          <fieldset className="form-section">
            <legend><Users size={16} /> Basic Information</legend>
            
            <label htmlFor="groupName">Group Name *</label>
            <input
              id="groupName"
              name="groupName"
              type="text"
              value={formData.groupName}
              onChange={handleChange}
              className={errors.groupName ? 'input-error' : ''}
              placeholder="Enter a unique group name"
              required
            />
            {errors.groupName && <output className="error-text">{errors.groupName}</output>}

            <section className="form-row">
              <section>
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
                {errors.contributionAmount && <output className="error-text">{errors.contributionAmount}</output>}
              </section>

              <section>
                <label htmlFor="frequency">Payment Frequency</label>
                <select id="frequency" name="frequency" value={formData.frequency} onChange={handleChange}>
                  <option value="Monthly">Monthly</option>
                  <option value="Weekly">Weekly</option>
                </select>
              </section>
            </section>
          </fieldset>

          <fieldset className="form-section">
            <legend><Calendar size={16} /> Logistics and Payout</legend>
            
            <section className="form-row">
              <section>
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
              </section>

              <section>
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
              </section>
            </section>

            <section className="form-row">
              <section>
                <label htmlFor="payoutOrder">Payout Order (1st - 31st) *</label>
                <input
                  id="payoutOrder"
                  name="payoutOrder"
                  type="number"
                  value={formData.payoutOrder}
                  onChange={handleChange}
                  className={errors.payoutOrder ? 'input-error' : ''}
                  placeholder="e.g., 1"
                  min="1"
                  max="31"
                  required
                />
                {errors.payoutOrder && <output className="error-text">{errors.payoutOrder}</output>}
              </section>

              <section>
                <label htmlFor="meetingFrequency">Meeting Frequency (Monthly) *</label>
                <input
                  id="meetingFrequency"
                  name="meetingFrequency"
                  type="number"
                  value={formData.meetingFrequency}
                  onChange={handleChange}
                  className={errors.meetingFrequency ? 'input-error' : ''}
                  placeholder="Meetings per month"
                  min="1"
                  required
                />
                {errors.meetingFrequency && <output className="error-text">{errors.meetingFrequency}</output>}
              </section>
            </section>
          </fieldset>

          <fieldset className="form-section treasurer-section">
            <legend><ShieldCheck size={16} /> Treasurer Information</legend>
            <output className="section-note">The treasurer manages the group funds and payouts.</output>

            <section className="form-row triple-col">
              <section>
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
                {errors['treasurer.firstName'] && <output className="error-text">{errors['treasurer.firstName']}</output>}
              </section>

              <section>
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
                {errors['treasurer.surname'] && <output className="error-text">{errors['treasurer.surname']}</output>}
              </section>

              <section>
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
                {errors['treasurer.email'] && <output className="error-text">{errors['treasurer.email']}</output>}
              </section>
            </section>
          </fieldset>

          <fieldset className="form-section">
            <legend><UserPlus size={16} /> Add Members</legend>
            <output className="section-note">Add members to invite them to this group.</output>

            {members.map((member) => (
              <article key={member.id} className="form-row triple-col member-entry">
                <section>
                  <label>Member Name</label>
                  <input
                    name="firstName"
                    placeholder="First Name"
                    value={member.firstName}
                    onChange={(e) => handleMemberChange(member.id, e)}
                  />
                </section>

                <section>
                  <label>Surname</label>
                  <input
                    name="surname"
                    placeholder="Surname"
                    value={member.surname}
                    onChange={(e) => handleMemberChange(member.id, e)}
                  />
                </section>

                <section>
                  <label>Email Address</label>
                  <section className="input-with-action">
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
                  </section>
                  {errors[`member_${member.id}_email`] && <output className="error-text">{errors[`member_${member.id}_email`]}</output>}
                </section>
              </article>
            ))}

            <button type="button" onClick={addMemberRow} className="add-row-btn">
              <Plus size={18} /> Add Another Member
            </button>
          </fieldset>

          <footer className="form-actions">
            <button type="submit" className="submit-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <span className="spinner"></span> Creating Group...
                </>
              ) : (
                <>Create Group</>
              )}
            </button>
          </footer>

        </form>
      </section>
    </main>
  );
};

export default CreateGroup;
