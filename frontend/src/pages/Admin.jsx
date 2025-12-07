import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { eventsAPI, registrationsAPI, contactAPI, announcementsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

function Admin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalEvents: 0,
    totalRegistrations: 0,
    unreadMessages: 0,
    totalAnnouncements: 0,
  });
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    fetchData();
  }, [isAdmin, navigate]);

  const fetchData = async () => {
    try {
      const [eventsRes, registrationsRes, messagesRes, unreadRes] = await Promise.all([
        eventsAPI.getAll(),
        registrationsAPI.getAll(),
        contactAPI.getAll(),
        contactAPI.getUnreadCount(),
      ]);

      setEvents(eventsRes.data);
      setRegistrations(registrationsRes.data);
      setMessages(messagesRes.data);

      setStats({
        totalEvents: eventsRes.data.length,
        totalRegistrations: registrationsRes.data.length,
        unreadMessages: unreadRes.data.unread_count,
        totalAnnouncements: 0,
      });
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRegistration = async (id, status, paymentStatus) => {
    try {
      await registrationsAPI.update(id, { status, payment_status: paymentStatus });
      fetchData();
    } catch (err) {
      alert('Failed to update registration');
    }
  };

  const handleMarkMessageRead = async (id) => {
    try {
      await contactAPI.markRead(id, true);
      fetchData();
    } catch (err) {
      console.error('Failed to mark message as read:', err);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="container">
          <div className="loading">Loading admin panel...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="container">
          <h1>Admin Dashboard</h1>
          <p>Manage events, registrations, and communications</p>
        </div>
      </div>

      <div className="container">
        <div className="admin-tabs">
          <button
            className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`tab-btn ${activeTab === 'registrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('registrations')}
          >
            Registrations ({stats.totalRegistrations})
          </button>
          <button
            className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          >
            Messages {stats.unreadMessages > 0 && <span className="badge">{stats.unreadMessages}</span>}
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'dashboard' && (
            <div className="dashboard">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📅</div>
                  <div className="stat-info">
                    <h3>{stats.totalEvents}</h3>
                    <p>Total Events</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📝</div>
                  <div className="stat-info">
                    <h3>{stats.totalRegistrations}</h3>
                    <p>Registrations</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📬</div>
                  <div className="stat-info">
                    <h3>{stats.unreadMessages}</h3>
                    <p>Unread Messages</p>
                  </div>
                </div>
              </div>

              <div className="recent-section">
                <h2>Recent Registrations</h2>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Event</th>
                        <th>Competitor</th>
                        <th>Status</th>
                        <th>Payment</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {registrations.slice(0, 5).map((reg) => (
                        <tr key={reg.id}>
                          <td>{reg.event_name}</td>
                          <td>{reg.first_name} {reg.last_name}</td>
                          <td>
                            <span className={`status ${reg.status}`}>{reg.status}</span>
                          </td>
                          <td>
                            <span className={`payment ${reg.payment_status}`}>{reg.payment_status}</span>
                          </td>
                          <td>{new Date(reg.registration_date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'registrations' && (
            <div className="registrations-admin">
              <h2>All Registrations</h2>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Event</th>
                      <th>Competitor</th>
                      <th>Club</th>
                      <th>Status</th>
                      <th>Payment</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrations.map((reg) => (
                      <tr key={reg.id}>
                        <td>#{reg.id}</td>
                        <td>{reg.event_name}</td>
                        <td>{reg.first_name} {reg.last_name}</td>
                        <td>{reg.club || '-'}</td>
                        <td>
                          <select
                            value={reg.status}
                            onChange={(e) => handleUpdateRegistration(reg.id, e.target.value, reg.payment_status)}
                            className="status-select"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="completed">Completed</option>
                          </select>
                        </td>
                        <td>
                          <select
                            value={reg.payment_status}
                            onChange={(e) => handleUpdateRegistration(reg.id, reg.status, e.target.value)}
                            className="status-select"
                          >
                            <option value="unpaid">Unpaid</option>
                            <option value="paid">Paid</option>
                            <option value="refunded">Refunded</option>
                          </select>
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => navigate(`/events/${reg.event_id}`)}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="messages-admin">
              <h2>Contact Messages</h2>
              <div className="messages-list">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`message-card ${msg.is_read ? 'read' : 'unread'}`}
                    onClick={() => !msg.is_read && handleMarkMessageRead(msg.id)}
                  >
                    <div className="message-header">
                      <div className="message-sender">
                        <strong>{msg.name}</strong>
                        <span>{msg.email}</span>
                      </div>
                      <div className="message-date">
                        {new Date(msg.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    {msg.subject && <div className="message-subject">{msg.subject}</div>}
                    <div className="message-body">{msg.message}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Admin;
