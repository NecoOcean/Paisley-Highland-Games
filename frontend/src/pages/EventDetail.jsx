import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { eventsAPI, registrationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './EventDetail.css';

function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isCompetitor } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registering, setRegistering] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await eventsAPI.getById(id);
        setEvent(response.data);
      } catch (err) {
        setError('Failed to load event details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleRegister = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/events/${id}` } });
      return;
    }

    if (!isCompetitor) {
      setMessage({ type: 'error', text: 'You need a competitor account to register for events.' });
      return;
    }

    setRegistering(true);
    setMessage(null);

    try {
      await registrationsAPI.register(id);
      setMessage({ type: 'success', text: 'Successfully registered for this event!' });
      // Refresh event data
      const response = await eventsAPI.getById(id);
      setEvent(response.data);
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to register for event';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setRegistering(false);
    }
  };

  const categoryLabels = {
    heavy: 'Heavy Events',
    dancing: 'Highland Dancing',
    piping: 'Piping & Drumming',
    athletics: 'Athletics',
    other: 'Other',
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBA';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="event-detail-page">
        <div className="container">
          <div className="loading">Loading event details...</div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="event-detail-page">
        <div className="container">
          <div className="error">{error || 'Event not found'}</div>
          <button className="btn btn-primary" onClick={() => navigate('/events')}>
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="event-detail-page">
      <div className="event-detail-header">
        <div className="container">
          <span className="event-category">{categoryLabels[event.category] || event.category}</span>
          <h1>{event.name}</h1>
        </div>
      </div>

      <div className="container">
        <div className="event-detail-content">
          <div className="event-main">
            <section className="event-section">
              <h2>About This Event</h2>
              <p className="event-description">{event.description}</p>
            </section>

            <section className="event-section">
              <h2>Event Details</h2>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Date</span>
                  <span className="detail-value">{formatDate(event.event_date)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Time</span>
                  <span className="detail-value">
                    {event.start_time || 'TBA'} - {event.end_time || 'TBA'}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Location</span>
                  <span className="detail-value">{event.location || 'TBA'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Category</span>
                  <span className="detail-value">{categoryLabels[event.category]}</span>
                </div>
              </div>
            </section>

            {event.registrations && event.registrations.length > 0 && (
              <section className="event-section">
                <h2>Registered Competitors ({event.registered_count})</h2>
                <div className="competitors-list">
                  {event.registrations.map((reg) => (
                    <div key={reg.id} className="competitor-item">
                      <span className="competitor-name">
                        {reg.first_name} {reg.last_name}
                      </span>
                      {reg.club && <span className="competitor-club">{reg.club}</span>}
                      {reg.nationality && <span className="competitor-nationality">{reg.nationality}</span>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="event-sidebar">
            <div className="registration-card">
              <h3>Registration</h3>

              <div className="registration-info">
                <div className="info-row">
                  <span>Registration Fee</span>
                  <span className="fee">
                    {event.registration_fee > 0 ? `£${event.registration_fee.toFixed(2)}` : 'Free'}
                  </span>
                </div>
                <div className="info-row">
                  <span>Max Participants</span>
                  <span>{event.max_participants}</span>
                </div>
                <div className="info-row">
                  <span>Spots Available</span>
                  <span className={event.spots_available <= 5 ? 'low-spots' : ''}>
                    {event.spots_available}
                  </span>
                </div>
              </div>

              {message && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}

              {event.spots_available > 0 ? (
                <button
                  className="btn btn-primary btn-block"
                  onClick={handleRegister}
                  disabled={registering}
                >
                  {registering ? 'Registering...' : user ? 'Register Now' : 'Login to Register'}
                </button>
              ) : (
                <button className="btn btn-disabled btn-block" disabled>
                  Event Full
                </button>
              )}

              {!user && (
                <p className="login-hint">
                  Don't have an account? <a href="/register">Sign up</a>
                </p>
              )}
            </div>
          </div>
        </div>

        <button className="btn btn-outline back-btn" onClick={() => navigate('/events')}>
          ← Back to Events
        </button>
      </div>
    </div>
  );
}

export default EventDetail;
