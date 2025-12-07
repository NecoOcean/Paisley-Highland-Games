import './Legal.css';

function Privacy() {
  return (
    <div className="legal-page">
      <div className="legal-header">
        <div className="legal-content">
          <h1>Privacy Policy</h1>
          <p>How we collect, use, and protect your information</p>
        </div>
      </div>

      <div className="legal-content">
        <section className="legal-section">
          <h2>Introduction</h2>
          <p>
            Paisley Highland Games ("we", "our", "us") is committed to protecting your privacy. This
            Privacy Policy explains how we collect, use, disclose, and safeguard your information when
            you visit our website and use our services.
          </p>
          <p>
            Please read this privacy policy carefully. If you do not agree with the terms of this
            privacy policy, please do not access the site.
          </p>
        </section>

        <section className="legal-section">
          <h2>Information We Collect</h2>

          <h3>Personal Data</h3>
          <p>
            When you register for an account or events, we may collect personally identifiable information, including:
          </p>
          <ul>
            <li>Full name</li>
            <li>Email address</li>
            <li>Telephone number</li>
            <li>Postal address</li>
            <li>Date of birth (for age-category competitions)</li>
            <li>Club or organisation affiliation</li>
            <li>Nationality</li>
            <li>Competition history and results</li>
          </ul>

          <h3>Payment Information</h3>
          <p>
            When you make payments for event registrations, payment data is processed securely by our
            third-party payment providers. We do not store complete credit card numbers on our servers.
          </p>

          <h3>Automatically Collected Data</h3>
          <p>When you access our website, we may automatically collect:</p>
          <ul>
            <li>Browser type and version</li>
            <li>Operating system</li>
            <li>IP address</li>
            <li>Access times and dates</li>
            <li>Pages viewed</li>
            <li>Referring website addresses</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Create and manage your user account</li>
            <li>Process event registrations and payments</li>
            <li>Communicate with you about events, updates, and changes</li>
            <li>Publish competition results and rankings</li>
            <li>Send promotional information (with your consent)</li>
            <li>Respond to your enquiries and support needs</li>
            <li>Improve our website and services</li>
            <li>Comply with legal obligations</li>
            <li>Detect and prevent fraud</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to enhance your experience on our website.
          </p>

          <h3>Essential Cookies</h3>
          <p>
            These cookies are necessary for the website to function properly. They enable core
            functionality such as security, authentication, and session management.
          </p>

          <h3>Analytics Cookies</h3>
          <p>
            We may use analytics services to help us understand how visitors interact with our website.
            This helps us improve our services.
          </p>

          <h3>Managing Cookies</h3>
          <p>
            You can control cookies through your browser settings. Note that disabling certain cookies
            may affect the functionality of our website.
          </p>
        </section>

        <section className="legal-section">
          <h2>Disclosure of Your Information</h2>
          <p>We may share your information in the following situations:</p>
          <ul>
            <li><strong>Competition Results:</strong> Competitor names and results are published publicly</li>
            <li><strong>Event Partners:</strong> With other Highland Games organisations for competition coordination</li>
            <li><strong>Service Providers:</strong> With third parties who perform services on our behalf</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            <li><strong>Business Transfers:</strong> In connection with any merger or acquisition</li>
          </ul>
        </section>

        <section className="legal-section">
          <h2>Data Security</h2>
          <p>
            We use administrative, technical, and physical security measures to protect your personal
            information. These include:
          </p>
          <ul>
            <li>Secure Socket Layer (SSL) encryption for data transmission</li>
            <li>Secure password hashing</li>
            <li>Regular security audits</li>
            <li>Restricted access to personal information</li>
          </ul>
          <p>
            While we have taken reasonable steps to secure your information, please be aware that no
            security measures are perfect or impenetrable.
          </p>
        </section>

        <section className="legal-section">
          <h2>Your Privacy Rights</h2>
          <p>Under UK data protection law, you have rights including:</p>
          <ul>
            <li>The right to access your personal data</li>
            <li>The right to rectification of inaccurate data</li>
            <li>The right to erasure of your data</li>
            <li>The right to restrict processing</li>
            <li>The right to data portability</li>
            <li>The right to object to processing</li>
          </ul>
          <p>
            For detailed information about your rights under UK GDPR, please visit our{' '}
            <a href="/gdpr">GDPR Compliance</a> page.
          </p>
        </section>

        <section className="legal-section">
          <h2>Children's Privacy</h2>
          <p>
            Our services may be used by competitors under 18 years of age. Registration for minors
            must be completed by a parent or legal guardian who consents to the collection and use
            of the minor's information as described in this policy.
          </p>
        </section>

        <section className="legal-section">
          <h2>Third-Party Links</h2>
          <p>
            Our website may contain links to third-party websites. We are not responsible for the
            privacy practices of these external sites. We encourage you to read their privacy policies.
          </p>
        </section>

        <section className="legal-section">
          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by
            posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>
        </section>

        <section className="legal-section">
          <h2>Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact us:</p>
          <div className="contact-box">
            <h4>Privacy Enquiries</h4>
            <p><strong>Email:</strong> privacy@paisleyhighlandgames.com</p>
            <p><strong>Address:</strong> Paisley Highland Games, Paisley, Renfrewshire, Scotland</p>
            <p><strong>Phone:</strong> +44 141 000 0000</p>
          </div>
          <p className="last-updated">Last updated: December 2025</p>
        </section>
      </div>
    </div>
  );
}

export default Privacy;
