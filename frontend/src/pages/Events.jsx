import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eventsAPI } from '../services/api';
import EventCard from '../components/EventCard';
import './Events.css';

function Events() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const selectedCategory = searchParams.get('category') || '';
  const searchQuery = searchParams.get('search') || '';

  const categories = [
    { value: '', label: 'All Events' },
    { value: 'heavy', label: 'Heavy Events' },
    { value: 'dancing', label: 'Highland Dancing' },
    { value: 'piping', label: 'Piping & Drumming' },
    { value: 'athletics', label: 'Athletics' },
    { value: 'other', label: 'Other' },
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const params = {};
        if (selectedCategory) params.category = selectedCategory;
        if (searchQuery) params.search = searchQuery;

        const response = await eventsAPI.getAll(params);
        setEvents(response.data);
      } catch (err) {
        setError('Failed to load events');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedCategory, searchQuery]);

  const handleCategoryChange = (category) => {
    if (category) {
      searchParams.set('category', category);
    } else {
      searchParams.delete('category');
    }
    setSearchParams(searchParams);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const search = formData.get('search');
    if (search) {
      searchParams.set('search', search);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="events-page">
      <div className="events-header">
        <div className="container">
          <h1>Events</h1>
          <p>Discover and register for Highland Games events</p>
        </div>
      </div>

      <div className="container">
        <div className="events-filters">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              name="search"
              placeholder="Search events..."
              defaultValue={searchQuery}
              className="search-input"
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          <div className="category-filters">
            {categories.map((cat) => (
              <button
                key={cat.value}
                className={`category-btn ${selectedCategory === cat.value ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading events...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : events.length === 0 ? (
          <div className="no-events">
            <p>No events found matching your criteria.</p>
            <button
              className="btn btn-outline"
              onClick={() => setSearchParams({})}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <p className="results-count">{events.length} event{events.length !== 1 ? 's' : ''} found</p>
            <div className="events-grid">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Events;
