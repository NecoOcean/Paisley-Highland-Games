import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { registrationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './MyRegistrations.css';

function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  const { user, isCompetitor } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !isCompetitor) {
      navigate('/login');
      return;
    }

    fetchRegistrations();
  }, [user, isCompetitor, navigate]);

  const fetchRegistrations = async () => {
    try {
      const response = await registrationsAPI.getMyRegistrations();
      setRegistrations(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setError('Please create a competitor profile first to register for events.');
      } else {
        setError('Failed to load registrations');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this registration?')) {
      return;
    }

    setCancelling(id);
    try {
      await registrationsAPI.cancel(id);
      await fetchRegistrations();
    } catch (err) {
      alert('Failed to cancel registration');
      console.error(err);
    } finally {
      setCancelling(null);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'TBA';
    return new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: '#d69e2e',
      confirmed: '#38a169',
      cancelled: '#e53e3e',
      completed: '#3182ce',
    };
    return (
      <span className="status-badge" style={{ backgroundColor: colors[status] || '#718096' }}>
        {status}
      </span>
    );
  };

  const getPaymentBadge = (status) => {
    const colors = {
      unpaid: '#e53e3e',
      paid: '#38a169',
      refunded: '#718096',
    };
    return (
      <span className="payment-badge" style={{ backgroundColor: colors[status] || '#718096' }}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="my-registrations-page">
        <div className="container">
          <div className="loading">Loading your registrations...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="my-registrations-page">
      <div className="page-header">
        <div className="container">
          <h1>My Registrations</h1>
          <p>Manage your event registrations</p>
        </div>
      </div>

      <div className="container">
        {error ? (
          <div className="error-box">
            <p>{error}</p>
            <button className="btn btn-primary" onClick={() => navigate('/events')}>
              Browse Events
            </button>
          </div>
        ) : registrations.length === 0 ? (
          <div className="empty-state">
            <h2>No Registrations Yet</h2>
            <p>You haven't registered for any events. Browse our events to get started!</p>
            <button className="btn btn-primary" onClick={() => navigate('/events')}>
              Browse Events
            </button>
          </div>
        ) : (
          <div className="registrations-list">
            {registrations.map((reg) => (
              <div key={reg.id} className={`registration-card ${reg.status}`}>
                <div className="registration-main">
                  <h3>{reg.event_name}</h3>
                  <div className="registration-details">
                    <span className="detail">
                      <span className="icon">📅</span>
                      {formatDate(reg.event_date)}
                    </span>
                    <span className="detail">
                      <span className="icon">🕐</span>
                      {reg.start_time || 'TBA'}
                    </span>
                    <span className="detail">
                      <span className="icon">📍</span>
                      {reg.location || 'TBA'}
                    </span>
                  </div>
                </div>

                <div className="registration-meta">
                  <div className="badges">
                    {getStatusBadge(reg.status)}
                    {getPaymentBadge(reg.payment_status)}
                  </div>
                  {reg.registration_fee > 0 && (
                    <div className="fee">£{reg.registration_fee.toFixed(2)}</div>
                  )}
                </div>

                <div className="registration-actions">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => navigate(`/events/${reg.event_id}`)}
                  >
                    View Event
                  </button>
                  {reg.status !== 'cancelled' && reg.status !== 'completed' && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCancel(reg.id)}
                      disabled={cancelling === reg.id}
                    >
                      {cancelling === reg.id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyRegistrations;
