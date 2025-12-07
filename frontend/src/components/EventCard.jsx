import { Link } from 'react-router-dom';
import './EventCard.css';

function EventCard({ event }) {
  const categoryColors = {
    heavy: '#c53030',
    dancing: '#2b6cb0',
    piping: '#2f855a',
    athletics: '#d69e2e',
    other: '#718096',
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
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="event-card">
      <div
        className="event-category-badge"
        style={{ backgroundColor: categoryColors[event.category] || categoryColors.other }}
      >
        {categoryLabels[event.category] || event.category}
      </div>

      <div className="event-card-content">
        <h3 className="event-title">{event.name}</h3>
        <p className="event-description">{event.description?.substring(0, 120)}...</p>

        <div className="event-details">
          <div className="event-detail">
            <span className="detail-icon">📅</span>
            <span>{formatDate(event.event_date)}</span>
          </div>
          {event.start_time && (
            <div className="event-detail">
              <span className="detail-icon">🕐</span>
              <span>{event.start_time} - {event.end_time || 'TBA'}</span>
            </div>
          )}
          {event.location && (
            <div className="event-detail">
              <span className="detail-icon">📍</span>
              <span>{event.location}</span>
            </div>
          )}
        </div>

        <div className="event-footer">
          <div className="event-stats">
            <span className="spots-available">
              {event.spots_available !== undefined
                ? `${event.spots_available} spots left`
                : `Max ${event.max_participants} participants`}
            </span>
            {event.registration_fee > 0 && (
              <span className="event-fee">£{event.registration_fee.toFixed(2)}</span>
            )}
          </div>
          <Link to={`/events/${event.id}`} className="btn btn-primary btn-sm">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EventCard;
