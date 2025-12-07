import './Legal.css';

function GDPR() {
  return (
    <div className="legal-page">
      <div className="legal-header">
        <div className="legal-content">
          <h1>GDPR Compliance</h1>
          <p>How we protect your personal data under UK GDPR</p>
        </div>
      </div>

      <div className="legal-content">
        <section className="legal-section gdpr-highlight">
          <h2>Our Commitment to Data Protection</h2>
          <p>
            The Paisley Highland Games is committed to protecting your personal data in full compliance
            with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
            This page explains how we collect, use, and protect your information.
          </p>
        </section>

        <section className="legal-section">
          <h2>Data Controller Information</h2>
          <p>
            Paisley Highland Games is the data controller responsible for your personal data.
          </p>
          <div className="contact-box">
            <h4>Data Protection Officer</h4>
            <p><strong>Email:</strong> dpo@paisleyhighlandgames.com</p>
            <p><strong>Address:</strong> Paisley Highland Games, Paisley, Renfrewshire, Scotland</p>
            <p><strong>Phone:</strong> +44 141 000 0000</p>
          </div>
        </section>

        <section className="legal-section">
          <h2>Lawful Basis for Processing</h2>
          <p>We process your personal data under the following lawful bases:</p>
          <ul>
            <li><strong>Contract:</strong> Processing necessary for competitor registration and event participation</li>
            <li><strong>Legitimate Interest:</strong> Improving our services and communicating about events</li>
            <li><strong>Consent:</strong> Marketing communications and optional data collection (you can withdraw consent at any time)</li>
            <li><strong>Legal Obligation:</strong> Compliance with health and safety regulations</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>What Data We Collect</h2>
          <h3>Information You Provide</h3>
          <ul>
            <li>Name, email address, and contact details</li>
            <li>Competitor profile information (club affiliation, nationality)</li>
            <li>Event registration and participation history</li>
            <li>Payment information (processed securely by third-party providers)</li>
            <li>Messages sent through our contact form</li>
          </ul>

          <h3>Automatically Collected Information</h3>
          <ul>
            <li>IP address and browser type</li>
            <li>Pages visited and time spent on site</li>
            <li>Device information</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>How We Use Your Data</h2>
          <ul>
            <li>Processing event registrations and managing competitions</li>
            <li>Communicating important event information and updates</li>
            <li>Publishing competition results and rankings</li>
            <li>Responding to enquiries and support requests</li>
            <li>Improving our website and services</li>
            <li>Complying with legal and regulatory requirements</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>Your Rights Under UK GDPR</h2>
          <p>You have the following rights regarding your personal data:</p>
          <div className="rights-grid">
            <div className="right-card">
              <h4>Right to Access</h4>
              <p>Request a copy of all personal data we hold about you.</p>
            </div>
            <div className="right-card">
              <h4>Right to Rectification</h4>
              <p>Request correction of inaccurate or incomplete personal data.</p>
            </div>
            <div className="right-card">
              <h4>Right to Erasure</h4>
              <p>Request deletion of your personal data ("right to be forgotten").</p>
            </div>
            <div className="right-card">
              <h4>Right to Restrict Processing</h4>
              <p>Request limitation of how we use your data.</p>
            </div>
            <div className="right-card">
              <h4>Right to Data Portability</h4>
              <p>Receive your data in a structured, machine-readable format.</p>
            </div>
            <div className="right-card">
              <h4>Right to Object</h4>
              <p>Object to processing based on legitimate interests or for marketing.</p>
            </div>
          </div>
        </section>

        <section className="legal-section">
          <h2>Data Retention</h2>
          <p>
            We retain your personal data only for as long as necessary to fulfill the purposes for which
            it was collected:
          </p>
          <ul>
            <li><strong>Account information:</strong> Retained while your account is active, plus 3 years after closure</li>
            <li><strong>Competition results:</strong> Retained indefinitely as part of historical records</li>
            <li><strong>Contact messages:</strong> Retained for 2 years</li>
            <li><strong>Financial records:</strong> Retained for 7 years as required by law</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>Data Security</h2>
          <p>
            We implement appropriate technical and organisational measures to protect your personal data, including:
          </p>
          <ul>
            <li>Encryption of data in transit using SSL/TLS</li>
            <li>Secure password hashing using industry-standard algorithms</li>
            <li>Regular security assessments and updates</li>
            <li>Access controls limiting who can view personal data</li>
            <li>Staff training on data protection responsibilities</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>Third-Party Data Sharing</h2>
          <p>We may share your data with:</p>
          <ul>
            <li><strong>Event partners:</strong> Other Highland Games organisations for competition coordination</li>
            <li><strong>Payment processors:</strong> For secure payment handling</li>
            <li><strong>Hosting providers:</strong> Who store our website data (within the UK/EEA)</li>
          </ul>
          <p>We do not sell your personal data to third parties.</p>
        </section>

        <section className="legal-section">
          <h2>International Transfers</h2>
          <p>
            Your data is primarily stored within the UK and European Economic Area (EEA). If we transfer
            data outside these areas, we ensure appropriate safeguards are in place, such as Standard
            Contractual Clauses approved by the UK Information Commissioner.
          </p>
        </section>

        <section className="legal-section">
          <h2>Cookies</h2>
          <p>
            Our website uses essential cookies to enable core functionality such as user authentication.
            For more information, please see our <a href="/privacy">Privacy Policy</a>.
          </p>
        </section>

        <section className="legal-section">
          <h2>Making a Complaint</h2>
          <p>
            If you are unhappy with how we have handled your personal data, you have the right to lodge
            a complaint with the Information Commissioner's Office (ICO):
          </p>
          <div className="contact-box">
            <h4>Information Commissioner's Office</h4>
            <p><strong>Website:</strong> <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a></p>
            <p><strong>Phone:</strong> 0303 123 1113</p>
          </div>
        </section>

        <section className="legal-section">
          <h2>Exercising Your Rights</h2>
          <p>
            To exercise any of your data protection rights, please contact our Data Protection Officer:
          </p>
          <div className="contact-box">
            <h4>Contact Us</h4>
            <p><strong>Email:</strong> dpo@paisleyhighlandgames.com</p>
            <p><strong>Response time:</strong> We will respond to your request within 30 days</p>
          </div>
          <p className="last-updated">Last updated: December 2025</p>
        </section>
      </div>
    </div>
  );
}

export default GDPR;
