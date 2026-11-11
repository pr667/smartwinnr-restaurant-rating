import React from 'react';
import { UtensilsCrossed, ShieldCheck, HeartHandshake } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--bg-subtle)',
        borderTop: '1px solid var(--border-light)',
        marginTop: 'auto',
        padding: '3rem 0 2rem',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '2rem',
            paddingBottom: '2rem',
            borderBottom: '1px solid var(--border-medium)',
          }}
        >
          {/* Brand & mission */}
          <div style={{ maxWidth: '420px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.6rem',
                marginBottom: '0.85rem',
              }}
            >
              <div
                style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--accent-forest)',
                  color: 'var(--text-inverse)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <UtensilsCrossed size={14} />
              </div>
              <span
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontWeight: 700,
                  fontSize: '1.2rem',
                  color: 'var(--text-primary)',
                }}
              >
                SmartWinnr Dining
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
              A curated restaurant discovery and verified rating platform. Built
              with architectural rigor, authentic MongoDB aggregation pipelines,
              and strict one-review-per-customer integrity.
            </p>
          </div>

          {/* Platform Standards */}
          <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
            <div>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                Platform Integrity
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                  <ShieldCheck size={14} color="var(--accent-forest)" /> Compound Unique Review Index
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)' }}>
                  <HeartHandshake size={14} color="var(--accent-forest)" /> Role-Based Backend Access
                </li>
                <li style={{ color: 'var(--text-muted)' }}>
                  MongoDB Aggregated Rating Distribution
                </li>
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
                Supported Roles
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <li>Platform Administrator</li>
                <li>Restaurant Owner</li>
                <li>Dining Customer</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '1.5rem',
            fontSize: '0.775rem',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <span>
            © {new Date().getFullYear()} SmartWinnr Technical Assessment Platform. All rights reserved.
          </span>
          <span>
            Genuine Full-Stack MERN Architecture
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
