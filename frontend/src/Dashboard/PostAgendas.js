import React, { useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'; // The Quill styling
import axios from 'axios';
import './PostAgendas.css';
import { useParams, useNavigate } from 'react-router-dom'; 

const PostAgendas = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [agenda, setAgenda] = useState(''); // Stores the HTML from ReactQuill
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [isError, setIsError] = useState(false);

  // Keep the toolbar simple and clean (From your team's code)
  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline'], 
      [{'list': 'ordered'}, {'list': 'bullet'}], 
      ['clean'] 
    ],
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setIsError(false);

    // Basic validation: ReactQuill leaves '<p><br></p>' when empty
    if (!agenda || agenda === '<p><br></p>') {
      setMessage("Please enter agenda details.");
      setIsError(true);
      setLoading(false);
      return;
    }

    try {
      //const apiUrl = 'http://localhost:5000/api';
      const apiUrl = 'https://tnbt-stokvel-management-assistant.onrender.com/api';
      
      // Grabbing the token just like your team's code does
      const token = localStorage.getItem('token') || sessionStorage.getItem('token'); 

      const agendaData = { 
        groupId: groupId, // <-- Added this!
        title: title, 
        date: date, 
        time: time, 
        agenda: agenda 
      };

      // Pointing to the correct meetings/agenda route
      const response = await axios.post(`${apiUrl}/meetings/agenda`, agendaData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 200 || response.status === 201) {
        setMessage('Agenda successfully posted to the group!');
        setIsError(false);
        setTitle('');
        setDate('');
        setTime('');
        setAgenda('');
      }
    } catch (error) {
      console.error('Error posting agenda:', error);
      setIsError(true);
      setMessage(error.response?.data?.message || error.message || 'Failed to post agenda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // <main> represents the dominant content of the page
    <main className="agenda-page-wrapper">
        <button 
            onClick={() => navigate(-1)} 
            style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', marginBottom: '15px' }}
        >
            ← Back to Dashboard
        </button>

      {/* <article> is perfect for a self-contained widget like a form card */}
      <article className="agenda-form-card">
        <header className="agenda-header">
          <h2>Post Meeting Agenda</h2>
          <p>Schedule the next stokvel meeting and outline the discussion topics.</p>
        </header>

        {message && (
          // <output> is semantically designed to show the result of a user action (like a form submission)
          <output className={`agenda-message ${isError ? 'error' : 'success'}`}>
            {message}
          </output>
        )}

        <form onSubmit={handleSubmit}>
          {/* <section> represents a standalone thematic grouping, making it a great valid block wrapper */}
          <section className="agenda-form-group">
            <label htmlFor="title" className="agenda-label">Meeting Title</label>
            <input 
              type="text" 
              id="title"
              className="agenda-input"
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g., April Monthly Contributions"
              required 
            />
          </section>

          {/* <fieldset> is the ultimate semantic tag for grouping related form elements together (like date/time).
              I added inline style reset so it doesn't add an ugly default border to your flex row */}
          <fieldset className="agenda-form-row" style={{ border: 'none', padding: 0, margin: 0 }}>
            <section className="agenda-form-group">
              <label htmlFor="date" className="agenda-label">Date</label>
              <input 
                type="date" 
                id="date"
                className="agenda-input"
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                required 
              />
            </section>
            <section className="agenda-form-group">
              <label htmlFor="time" className="agenda-label">Time</label>
              <input 
                type="time" 
                id="time"
                className="agenda-input"
                value={time} 
                onChange={(e) => setTime(e.target.value)} 
                required 
              />
            </section>
          </fieldset>

          <section className="agenda-form-group">
            <label className="agenda-label">Agenda Items</label>
            <ReactQuill 
              theme="snow" 
              value={agenda} 
              onChange={setAgenda} 
              modules={quillModules}
              placeholder="Type the agenda here. Use the toolbar to format..."
            />
          </section>

          <button type="submit" className="agenda-submit-btn" disabled={loading}>
            {loading ? 'Posting Agenda...' : 'Post Agenda'}
          </button>
        </form>
      </article>
    </main>
  );
}

export default PostAgendas;