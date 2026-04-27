import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './ScheduleMeeting.css';

const ScheduleMeeting = () => {
  const { groupId } = useParams();
  const [platform, setPlatform] = useState('google-meet');
  const [locationType, setLocationType] = useState('online');
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    meetingTitle: '',
    purpose: '',
    meetingDate: '',
    startTime: '',
    endTime: '',
    otherPlatform: '',
    meetingLink: '',
    physicalLocation: ''
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleGoBack = (e) => {
    e.preventDefault();
    navigate(-1);
  };

  // --- VALIDATION LOGIC ---
  const validateForm = () => {
    const { meetingTitle, meetingDate, startTime, endTime, otherPlatform, physicalLocation } = formData;

    // 1. Basic Check for empty required strings
    if (!meetingTitle.trim() || !meetingDate || !startTime || !endTime) {
      alert("Please fill in all required fields marked with *");
      return false;
    }

    // 2. Time Validation: End Time must be after Start Time
    if (startTime >= endTime) {
      alert("The Meeting End Time must be later than the Start Time.");
      return false;
    }

    // 3. Conditional Required: Other Platform Name
    if (locationType === 'online' && platform === 'others' && !otherPlatform.trim()) {
      alert("Please specify the platform name.");
      return false;
    }

    // 4. Conditional Required: Physical Address
    if (locationType === 'in-person' && !physicalLocation.trim()) {
      alert("Please provide the physical meeting address.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Trigger our custom validation before calling the API
    if (!validateForm()) return;

    const meetingData = {
      ...formData,
      groupId: groupId,
      locationType,
      platform,
      meetingLink: locationType === 'online' ? formData.meetingLink : '',
      physicalLocation: locationType === 'in-person' ? formData.physicalLocation : ''
    };

    try {
      console.log('Meeting data being sent:', meetingData);
      await axios.post('http://localhost:5000/api/meetings/schedule', meetingData);
      alert("Meeting Scheduled Successfully!");
      navigate(-1);
    } catch (error) {
      console.error("Error saving meeting:", error);
      alert(error.response?.data?.error || "Failed to schedule meeting.");
    }
  };

  return (
    <section className="app-shell">
      <nav className="top-navbar" aria-label="Main Navigation">
        <header className="navbar-content">
          <button onClick={handleGoBack} className="back-link-btn" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px' }}>
            <span className="back-icon" aria-hidden="true">←</span>
          </button>
        </header>
      </nav>

      <main className="schedule-page">
        <article className="form-card">
          <header className="form-header">
            <figure className="header-icon-container">
              <span className="header-icon" role="img" aria-label="Calendar">📅</span>
            </figure>
            <hgroup>
              <h2>Schedule Meeting</h2>
              <p>Group ID: {groupId || "General"}</p>
            </hgroup>
          </header>

          <form className="meeting-form" onSubmit={handleSubmit} noValidate={false}>
            {/* Title - Required */}
            <section className="input-group">
              <label htmlFor="meetingTitle">Meeting Title <mark className="required-marker">*</mark></label>
              <input 
                type="text" 
                id="meetingTitle" 
                placeholder="e.g., Project Kickoff Meeting" 
                required 
                value={formData.meetingTitle}
                onChange={handleInputChange} 
              />
            </section>

            <section className="input-group">
              <label htmlFor="purpose">Purpose / Agenda (optional)</label>
              <textarea id="purpose" rows="3" placeholder="Add description" value={formData.purpose} onChange={handleInputChange}></textarea>
            </section>

            {/* Date and Time - Required */}
            <fieldset className="form-row">
              <section className="input-group">
                <label htmlFor="meetingDate">Date <mark className="required-marker">*</mark></label>
                <input 
                  type="date" 
                  id="meetingDate" 
                  required 
                  min={new Date().toISOString().split("T")[0]} // Prevents scheduling in the past
                  value={formData.meetingDate}
                  onChange={handleInputChange}
                />
              </section>
              <section className="input-group">
                <label htmlFor="startTime">Time <mark className="required-marker">*</mark></label>
                <section className="time-range-group">
                  <input type="time" id="startTime" required value={formData.startTime} onChange={handleInputChange} />
                  <span aria-hidden="true">to</span>
                  <input type="time" id="endTime" required value={formData.endTime} onChange={handleInputChange} />
                </section>
              </section>
            </fieldset>

            <fieldset className="input-group">
              <legend>Location Type <mark className="required-marker">*</mark></legend>
              <nav className="toggle-navigation" role="group">
                <button type="button" className={`toggle-btn ${locationType === 'online' ? 'active' : ''}`} onClick={() => setLocationType('online')}>Online</button>
                <button type="button" className={`toggle-btn ${locationType === 'in-person' ? 'active' : ''}`} onClick={() => setLocationType('in-person')}>In-person</button>
              </nav>
            </fieldset>

            {locationType === 'online' ? (
              <>
                <section className="input-group">
                  <label htmlFor="platform">Meeting Platform</label>
                  <select id="platform" value={platform} onChange={(e) => setPlatform(e.target.value)}>
                    <option value="google-meet">Google Meet</option>
                    <option value="zoom">Zoom</option>
                    <option value="others">Others</option>
                  </select>
                </section>

                {platform === 'others' && (
                  <section className="input-group">
                    <label htmlFor="otherPlatform">Specify Platform <mark className="required-marker">*</mark></label>
                    <input type="text" id="otherPlatform" placeholder="Platform name" required value={formData.otherPlatform} onChange={handleInputChange} />
                  </section>
                )}
              </>
            ) : (
              <section className="input-group">
                <label htmlFor="physicalLocation">Meeting Room / Address <mark className="required-marker">*</mark></label>
                <input type="text" id="physicalLocation" placeholder="Address" required value={formData.physicalLocation} onChange={handleInputChange} />
              </section>
            )}

            <footer className="form-footer">
              <button type="button" onClick={handleGoBack} className="cancel-link" style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer' }}>Cancel</button>
              <button type="submit" className="submit-btn">Schedule Meeting</button>
            </footer>
          </form>
        </article>
      </main>
    </section>
  );
};

export default ScheduleMeeting;