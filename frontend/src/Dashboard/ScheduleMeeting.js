import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './ScheduleMeeting.css';

const ScheduleMeeting = ({ onBackToDashboard }) => {
  // Capturing groupId from URL parameters
  const { groupId: urlGroupId } = useParams();
  const navigate = useNavigate();
  const formRef = useRef(null);

  // State Management
  const [platform, setPlatform] = useState('google-meet');
  const [locationType, setLocationType] = useState('online');
  const [modal, setModal] = useState({
    show: false,
    message: '',
    isError: false
  });

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

  // Ensure groupId is captured correctly if passed via props or URL
  const currentGroupId = urlGroupId || "General";

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleGoBack = (e) => {
    e.preventDefault();
    if (onBackToDashboard) {
      onBackToDashboard();
    } else {
      navigate(-1);
    }
  };

  const closeModal = () => {
    const wasSuccessful = !modal.isError && modal.message.includes("Meeting Scheduled Successfully!");
    setModal({ ...modal, show: false });
    
    if (wasSuccessful) {
      formRef.current?.reset();
      setFormData({
        meetingTitle: '', purpose: '', meetingDate: '', startTime: '',
        endTime: '', otherPlatform: '', meetingLink: '', physicalLocation: ''
      });
      setPlatform('google-meet');
      setLocationType('online');
      
      if (onBackToDashboard) {
        onBackToDashboard(); 
      } else {
        navigate(-1);
      }
    }
  };

  const validateForm = () => {
    const { meetingTitle, meetingDate, startTime, endTime, otherPlatform, physicalLocation, meetingLink } = formData;

    if (!meetingTitle.trim() || !meetingDate || !startTime || !endTime) {
      setModal({ show: true, message: "Please fill in all required fields marked with *", isError: true });
      return false;
    }

    if (startTime >= endTime) {
      setModal({ show: true, message: "The Meeting End Time must be later than the Start Time.", isError: true });
      return false;
    }

    if (locationType === 'online') {
      if (platform !== 'others' && !meetingLink.trim()) {
        setModal({ show: true, message: "Please provide the meeting link (e.g., Zoom or Google Meet link).", isError: true });
        return false;
      }
      if (platform === 'others' && !otherPlatform.trim()) {
        setModal({ show: true, message: "Please specify the platform name.", isError: true });
        return false;
      }
    }

    if (locationType === 'in-person' && !physicalLocation.trim()) {
      setModal({ show: true, message: "Please provide the physical meeting address.", isError: true });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const meetingData = {
      ...formData,
      groupId: currentGroupId,
      locationType,
      platform,
      meetingLink: locationType === 'online' ? formData.meetingLink : '',
      physicalLocation: locationType === 'in-person' ? formData.physicalLocation : ''
    };

    try {
      await axios.post('https://tnbt-stokvel-management-assistant.onrender.com/api/meetings/schedule', meetingData);
      
      const existingMeetings = JSON.parse(localStorage.getItem('stokvel_meetings') || '[]');
      existingMeetings.push(meetingData);
      localStorage.setItem('stokvel_meetings', JSON.stringify(existingMeetings));

      setModal({
        show: true,
        message: `Meeting Scheduled Successfully! \n Title: ${formData.meetingTitle} \n Time: ${formData.startTime}`,
        isError: false
      });
    } catch (error) {
      console.error("Error saving meeting:", error);
      setModal({
        show: true,
        message: error.response?.data?.error || "Failed to schedule meeting.",
        isError: true
      });
    }
  };

  return (
    <section className="app-shell">
      {modal.show && (
        <aside className="modal-overlay">
          <dialog open className="modal-content">
            <header className="modal-header">
              <strong className={`modal-icon ${modal.isError ? 'icon-error' : 'icon-success'}`}>
                {modal.isError ? '⚠️' : '✅'}
              </strong>
              <h3>{modal.isError ? 'Notice' : 'Success!'}</h3>
            </header>
            <article className="modal-body">
              <output className="modal-message">{modal.message}</output>
            </article>
            <footer className="modal-actions">
              <button type="button" className="modal-btn" onClick={closeModal}>OK</button>
            </footer>
          </dialog>
        </aside>
      )}

      <main className="schedule-page">
        <article className="form-card">
          <header className="form-header">
            <figure className="header-icon-container">
              <strong className="header-icon">📅</strong>
            </figure>
            <hgroup>
              <h2>Schedule Meeting</h2>
              <p>Group ID: <address style={{ display: 'inline', fontStyle: 'normal' }}>{currentGroupId}</address></p>
            </hgroup>
          </header>

          <form ref={formRef} className="meeting-form" onSubmit={handleSubmit} noValidate={false}>
            <section className="input-group">
              <label htmlFor="meetingTitle">Meeting Title <mark className="required-marker">*</mark></label>
              <input 
                type="text" id="meetingTitle" placeholder="e.g., Project Kickoff Meeting" 
                required value={formData.meetingTitle} onChange={handleInputChange} 
              />
            </section>

            <section className="input-group">
              <label htmlFor="purpose">Purpose / Agenda (optional)</label>
              <textarea id="purpose" rows="3" placeholder="Add description" value={formData.purpose} onChange={handleInputChange}></textarea>
            </section>

            <fieldset className="form-row">
              <section className="input-group">
                <label htmlFor="meetingDate">Date <mark className="required-marker">*</mark></label>
                <input 
                  type="date" id="meetingDate" required min={new Date().toISOString().split("T")[0]} 
                  value={formData.meetingDate} onChange={handleInputChange}
                />
              </section>
              <section className="input-group">
                <label htmlFor="startTime">Time <mark className="required-marker">*</mark></label>
                <section className="time-range-group">
                  <input type="time" id="startTime" required value={formData.startTime} onChange={handleInputChange} />
                  <strong aria-hidden="true">to</strong>
                  <input type="time" id="endTime" required value={formData.endTime} onChange={handleInputChange} />
                </section>
              </section>
            </fieldset>

            <fieldset className="input-group">
              <legend>Location Type <mark className="required-marker">*</mark></legend>
              <nav className="toggle-navigation">
                <button type="button" className={`toggle-btn ${locationType === 'online' ? 'active' : ''}`} onClick={() => setLocationType('online')}>Online</button>
                <button type="button" className={`toggle-btn ${locationType === 'in-person' ? 'active' : ''}`} onClick={() => setLocationType('in-person')}>In-person</button>
              </nav>
            </fieldset>

            {locationType === 'online' ? (
              <section className="online-fields">
                <section className="input-group">
                  <label htmlFor="platform">Meeting Platform</label>
                  <select id="platform" value={platform} onChange={(e) => setPlatform(e.target.value)}>
                    <option value="google-meet">Google Meet</option>
                    <option value="zoom">Zoom</option>
                    <option value="others">Others</option>
                  </select>
                </section>

                <section className="input-group">
                  <label htmlFor="meetingLink">
                    Meeting Link {platform !== 'others' && <mark className="required-marker">*</mark>}
                  </label>
                  <input 
                    type="url" id="meetingLink" placeholder="Paste your Meeting link here" 
                    required={platform !== 'others'} value={formData.meetingLink} onChange={handleInputChange} 
                  />
                </section>

                {platform === 'others' && (
                  <section className="input-group">
                    <label htmlFor="otherPlatform">Specify Platform <mark className="required-marker">*</mark></label>
                    <input type="text" id="otherPlatform" placeholder="Platform name" required value={formData.otherPlatform} onChange={handleInputChange} />
                  </section>
                )}
              </section>
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