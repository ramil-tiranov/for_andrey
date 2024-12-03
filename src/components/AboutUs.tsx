import React from 'react';
import './style/AboutUs.css'; // Import the styles for the About Us page
import NavBar from '../components/NavBar'; 

const AboutUs: React.FC = () => {
  return (
    <>
      <NavBar /> {/* Wrap NavBar in a fragment or main div */}
      <div className="about-us-container">
        <header className="about-header">
          <h1>About Us</h1>
          <p>Our mission is to create impactful solutions with dedication and passion.</p>
        </header>

        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            We are committed to delivering top-notch products and services that help our clients succeed.
            Our team is dedicated to continuous innovation and quality improvement.
          </p>
        </section>

        <section className="team-section">
          <h2>Meet the Team</h2>
          <div className="team-container">
            <div className="team-member">
              <img src="/default-avatar.png" alt="Team member" className="team-image" />
              <h3>Jane Doe</h3>
              <p>CEO</p>
            </div>
            <div className="team-member">
              <img src="/default-avatar.png" alt="Team member" className="team-image" />
              <h3>John Smith</h3>
              <p>CTO</p>
            </div>
            <div className="team-member">
              <img src="/default-avatar.png" alt="Team member" className="team-image" />
              <h3>Emily Johnson</h3>
              <p>Head of Design</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default AboutUs;
