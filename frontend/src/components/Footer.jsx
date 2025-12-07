import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3>Paisley Highland Games</h3>
          <p>Celebrating Scottish heritage and tradition since 1879. Join us for two days of competition, entertainment, and community spirit.</p>
        </div>

        <div className="footer-section">
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/events">Events</a></li>
            <li><a href="/about">About Us</a></li>
            <li><a href="/contact">Contact</a></li>
            <li><a href="/register">Register</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Event Categories</h4>
          <ul>
            <li><a href="/events?category=heavy">Heavy Events</a></li>
            <li><a href="/events?category=dancing">Highland Dancing</a></li>
            <li><a href="/events?category=piping">Piping & Drumming</a></li>
            <li><a href="/events?category=athletics">Athletics</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4>Contact Info</h4>
          <ul className="contact-info">
            <li>Paisley, Scotland</li>
            <li>info@paisleyhighlandgames.com</li>
            <li>+44 141 000 0000</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Paisley Highland Games. All rights reserved.</p>
        <div className="footer-legal">
          <a href="/privacy">Privacy Policy</a>
          <a href="/terms">Terms of Service</a>
          <a href="/gdpr">GDPR</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
