import './About.css';

function About() {
  return (
    <div className="about-page">
      <div className="about-header">
        <div className="container">
          <h1>About Paisley Highland Games</h1>
          <p>Celebrating Scottish Heritage Since 1879</p>
        </div>
      </div>

      <div className="container">
        <section className="about-section">
          <h2>Our History</h2>
          <p>
            The Paisley Highland Games has been a cornerstone of Scottish cultural celebration
            for over 140 years. What began as a small gathering of local athletes has grown
            into one of Scotland's premier Highland Games events, attracting competitors and
            spectators from around the world.
          </p>
          <p>
            Located in the historic town of Paisley, Renfrewshire, our games showcase the
            best of Scottish tradition, from the thundering caber toss to the graceful
            movements of Highland dancers, all set against the backdrop of Scotland's
            beautiful landscape.
          </p>
        </section>

        <section className="about-section">
          <h2>The Events</h2>
          <div className="events-overview">
            <div className="event-category-card">
              <h3>Heavy Events</h3>
              <p>
                The heart of any Highland Games, featuring traditional tests of strength
                including the Caber Toss, Stone Put, Hammer Throw, and Weight Over Bar.
                Watch athletes demonstrate incredible power and technique in these
                iconic Scottish sports.
              </p>
            </div>

            <div className="event-category-card">
              <h3>Highland Dancing</h3>
              <p>
                A celebration of grace, precision, and Scottish tradition. Dancers of
                all ages compete in the Highland Fling, Sword Dance, Seann Triubhas,
                and other traditional dances that have been passed down through generations.
              </p>
            </div>

            <div className="event-category-card">
              <h3>Piping & Drumming</h3>
              <p>
                The stirring sound of bagpipes fills the air as individual pipers and
                pipe bands compete for top honors. Our competitions attract some of
                Scotland's finest musicians, carrying on a musical tradition centuries old.
              </p>
            </div>

            <div className="event-category-card">
              <h3>Athletics</h3>
              <p>
                From the challenging Hill Race through Gleniffer Braes to the team-based
                Tug of War, our athletics events offer something for everyone, from
                seasoned competitors to those just starting their Highland Games journey.
              </p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Location</h2>
          <p>
            The Paisley Highland Games takes place in Paisley, located just west of
            Glasgow in Renfrewshire, Scotland. The town is easily accessible by road,
            rail, and air, with Glasgow Airport just minutes away.
          </p>
          <div className="location-features">
            <div className="location-feature">
              <strong>By Rail:</strong> Paisley Gilmour Street station is on the main
              Glasgow to Ayr line, with frequent services from Glasgow Central.
            </div>
            <div className="location-feature">
              <strong>By Air:</strong> Glasgow Airport is located in Paisley, making
              international travel convenient.
            </div>
            <div className="location-feature">
              <strong>By Road:</strong> Easy access from the M8 motorway connecting
              Edinburgh and Glasgow.
            </div>
          </div>
        </section>

        <section className="about-section gdpr-section">
          <h2>Privacy & Data Protection</h2>
          <p>
            The Paisley Highland Games is committed to protecting your personal data
            in compliance with the UK General Data Protection Regulation (UK GDPR)
            and the Data Protection Act 2018.
          </p>
          <h3>How We Use Your Data</h3>
          <ul>
            <li>Competitor registration and event management</li>
            <li>Communication about events and updates</li>
            <li>Processing payments for registration fees</li>
            <li>Improving our services and user experience</li>
          </ul>
          <h3>Your Rights</h3>
          <ul>
            <li>Right to access your personal data</li>
            <li>Right to rectification of inaccurate data</li>
            <li>Right to erasure (right to be forgotten)</li>
            <li>Right to data portability</li>
            <li>Right to object to processing</li>
          </ul>
          <p>
            For any data protection queries, please contact our Data Protection Officer
            at dpo@paisleyhighlandgames.com
          </p>
        </section>
      </div>
    </div>
  );
}

export default About;
