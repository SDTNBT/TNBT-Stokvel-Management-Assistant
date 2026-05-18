import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'; // CRITICAL: This imports the styling for the toolbar! 

export const PostAgenda = () => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [agenda, setAgenda] = useState(''); // This will now store HTML formatting
  
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Keep the toolbar simple and clean
  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'], // Text formatting
      [{'list': 'ordered'}, {'list': 'bullet'}], // Lists
      ['clean'] // Remove formatting button
    ],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage('');
    setIsError(false);

    // Basic validation: ReactQuill leaves '<p><br></p>' when empty
    if (!agenda || agenda === '<p><br></p>') {
      setStatusMessage("Please enter agenda details.");
      setIsError(true);
      setLoading(false);
      return;
    }

    try {
      //const apiUrl = 'http://localhost:5000/api';
      const apiUrl = 'https://tnbt-stokvel-management-assistant.onrender.com/api';
      const token = localStorage.getItem('token'); 

      const response = await fetch(`${apiUrl}/meetings/agenda`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, date, time, agenda }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMessage('Agenda successfully posted to the group!');
        setTitle('');
        setDate('');
        setTime('');
        setAgenda(''); 
      } else {
        throw new Error(data.message || 'Server rejected the agenda');
      }
    } catch (err) {
      console.error("Agenda Post Error:", err);
      setStatusMessage(err.message || 'Connection failed. Please try again.');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="agenda-container">
      <h2>Post Meeting Agenda</h2>
      <p>Schedule the next stokvel meeting and outline the discussion topics.</p>

      {statusMessage && (
        <div className={isError ? "alert-error" : "alert-success"}>
          {statusMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="agenda-form">
        <div className="form-group">
          <label htmlFor="title">Meeting Title</label>
          <input 
            type="text" 
            id="title"
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="e.g., April Monthly Contributions"
            required 
          />
        </div>

        <div className="form-row">
          <div className="form-group half-width">
            <label htmlFor="date">Date</label>
            <input 
              type="date" 
              id="date"
              value={date} 
              onChange={(e) => setDate(e.target.value)} 
              required 
            />
          </div>
          <div className="form-group half-width">
            <label htmlFor="time">Time</label>
            <input 
              type="time" 
              id="time"
              value={time} 
              onChange={(e) => setTime(e.target.value)} 
              required 
            />
          </div>
        </div>

        <div className="form-group agenda-quill-container">
          <label>Agenda Items</label>
          {/* Replaced textarea with ReactQuill */}
          <ReactQuill 
            theme="snow" 
            value={agenda} 
            onChange={setAgenda} 
            modules={quillModules}
            placeholder="Type the agenda here. Use the toolbar to format..."
          />
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Posting Agenda...' : 'Post Agenda'}
        </button>
      </form>
    </section>
  );
};
