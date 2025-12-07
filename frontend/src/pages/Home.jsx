import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { eventsAPI, announcementsAPI } from '../services/api';
import EventCard from '../components/EventCard';
import './Home.css';

function Home() {
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, announcementsRes] = await Promise.all([
          eventsAPI.getAll(),
          announcementsAPI.getAll(3),
        ]);
        setEvents(eventsRes.data.slice(0, 4));
        setAnnouncements(announcementsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Paisley Highland Games 2025</h1>
          <p className="hero-subtitle">Celebrate Scottish Heritage & Tradition</p>
          <p className="hero-date">July 12-13, 2025 | Paisley, Scotland</p>
          <div className="hero-buttons">
            <Link to="/events" className="btn btn-primary btn-lg">View Events</Link>
            <Link to="/register" className="btn btn-outline-light btn-lg">Register Now</Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🏋️</div>
              <h3>Heavy Events</h3>
              <p>Watch traditional Highland athletics including caber toss, stone put, and hammer throw.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💃</div>
              <h3>Highland Dancing</h3>
              <p>Experience the grace and precision of traditional Scottish Highland dancing.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎵</div>
              <h3>Piping & Drumming</h3>
              <p>Hear the stirring sounds of bagpipes and drums from Scotland's finest musicians.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏃</div>
              <h3>Athletics</h3>
              <p>Compete in running events and team competitions for all skill levels.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="upcoming-events">
        <div className="container">
          <div className="section-header">
            <h2>Upcoming Events</h2>
            <Link to="/events" className="view-all-link">View All Events →</Link>
          </div>

          {loading ? (
            <div className="loading">Loading events...</div>
          ) : (
            <div className="events-grid">
              {events.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Announcements Section */}
      <section className="announcements-section">
        <div className="container">
          <h2>Latest News</h2>

          {loading ? (
            <div className="loading">Loading announcements...</div>
          ) : (
            <div className="announcements-list">
              {announcements.map(announcement => (
                <div key={announcement.id} className="announcement-card">
                  <div className="announcement-date">
                    {new Date(announcement.published_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </div>
                  <h3>{announcement.title}</h3>
                  <p>{announcement.content.substring(0, 200)}...</p>
                  <Link to={`/announcements/${announcement.id}`} className="read-more">
                    Read More →
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Compete?</h2>
            <p>Register today and be part of Scotland's premier Highland Games event.</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-primary btn-lg">Create Account</Link>
              <Link to="/about" className="btn btn-outline-dark btn-lg">Learn More</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
