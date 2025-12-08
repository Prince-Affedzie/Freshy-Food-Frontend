// src/pages/ContactPage.jsx
import React, { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiClock } from 'react-icons/fi';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send this to your backend
    console.log('Contact form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const contactInfo = [
    {
      icon: <FiPhone />,
      title: 'Call Us',
      details: ['0800-FRESH-FOOD', '080-1234-5678']
    },
    {
      icon: <FiMail />,
      title: 'Email Us',
      details: ['hello@freshharvest.com', 'orders@freshharvest.com']
    },
    {
      icon: <FiMapPin />,
      title: 'Visit Us',
      details: ['123 Farm Road', 'City Center', 'Your City']
    },
    {
      icon: <FiClock />,
      title: 'Hours',
      details: ['Mon-Fri: 8am-6pm', 'Sat: 9am-4pm', 'Sun: Closed']
    }
  ];

  return (
    <div className="contact-page">
      <div className="container">
        <div className="page-header">
          <h1>Get in Touch</h1>
          <p className="page-subtitle">
            Have questions? We're here to help with your fresh food deliveries.
          </p>
        </div>

        <div className="contact-layout">
          {/* Contact Form */}
          <div className="contact-form">
            <h2>Send us a Message</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Email *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="5"
                  required
                  placeholder="Tell us how we can help..."
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="contact-info">
            <h2>Contact Information</h2>
            <p className="info-intro">
              We'd love to hear from you. Here's how you can reach us:
            </p>

            <div className="info-grid">
              {contactInfo.map((info, index) => (
                <div key={index} className="info-card">
                  <div className="info-icon">{info.icon}</div>
                  <h3>{info.title}</h3>
                  {info.details.map((detail, idx) => (
                    <p key={idx}>{detail}</p>
                  ))}
                </div>
              ))}
            </div>

            <div className="faq-preview">
              <h3>Quick Answers</h3>
              <div className="faq-item">
                <h4>How do I customize my basket?</h4>
                <p>After selecting a package, you can add, remove, or swap items on the customization page.</p>
              </div>
              <div className="faq-item">
                <h4>What's your delivery area?</h4>
                <p>We currently deliver within major cities. Contact us to check if we serve your area.</p>
              </div>
              <div className="faq-item">
                <h4>Can I pause my deliveries?</h4>
                <p>Yes! You can pause or skip weeks as needed. Just contact us before your delivery day.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;