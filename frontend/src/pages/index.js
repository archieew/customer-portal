/**
 * Home Page - Bookings Dashboard
 * 
 * Displays a list of all customer bookings.
 * Each booking card links to the detailed booking view.
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout';
import * as api from '../lib/api';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Returns the appropriate CSS class for a status badge
 */
const getStatusClass = (status) => {
  const statusLower = status?.toLowerCase() || '';
  
  if (statusLower === 'completed') return 'badge-completed';
  if (statusLower === 'quote') return 'badge-quote';
  if (statusLower === 'work order') return 'badge-work-order';
  return 'badge-pending';
};

/**
 * Formats a date string for display
 */
const formatDate = (dateStr) => {
  if (!dateStr) return 'Not scheduled';
  
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-AU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

// =============================================================================
// COMPONENT
// =============================================================================

export default function HomePage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch bookings on mount
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const data = await api.getBookings();
        setBookings(data.bookings || []);
      } catch (err) {
        setError(err.message || 'Failed to load bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  return (
    <Layout title="My Bookings | Customer Portal">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-2xl font-bold text-white mb-2">My Bookings</h1>
          <p className="text-[--color-text-secondary]">
            View and manage your service appointments
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-[--color-text-secondary]">Loading bookings...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="card p-8 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Error Loading Bookings</h2>
            <p className="text-[--color-text-secondary] mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="btn-secondary"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && bookings.length === 0 && (
          <div className="card p-8 text-center animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand-600/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">No Bookings Found</h2>
            <p className="text-[--color-text-secondary]">
              You don't have any bookings yet. Contact us to schedule your first service.
            </p>
          </div>
        )}

        {/* Bookings grid */}
        {!loading && !error && bookings.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {bookings.map((booking, index) => (
              <Link 
                key={booking.id} 
                href={`/booking/${booking.id}`}
                className={`card group hover:border-brand-600/50 transition-all duration-200 animate-fade-in stagger-${Math.min(index + 1, 5)}`}
                style={{ opacity: 0 }}
              >
                {/* Status badge */}
                <div className="flex items-start justify-between mb-4">
                  <span className={getStatusClass(booking.status)}>
                    {booking.status}
                  </span>
                  <span className="text-xs text-[--color-text-secondary] font-mono">
                    {booking.jobNumber}
                  </span>
                </div>

                {/* Booking description */}
                <h3 className="font-semibold text-white mb-2 group-hover:text-brand-300 transition-colors">
                  {booking.description}
                </h3>

                {/* Address */}
                <div className="flex items-start gap-2 text-sm text-[--color-text-secondary] mb-4">
                  <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="line-clamp-2">{booking.address}</span>
                </div>

                {/* Date and amount */}
                <div className="flex items-center justify-between pt-4 border-t border-[--color-border]">
                  <div className="flex items-center gap-2 text-sm text-[--color-text-secondary]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDate(booking.date)}</span>
                  </div>
                  
                  {booking.amount > 0 && (
                    <span className="font-semibold text-accent-400">
                      ${booking.amount.toFixed(2)}
                    </span>
                  )}
                </div>

                {/* View arrow */}
                <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

