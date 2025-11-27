/**
 * Booking Detail Page
 * 
 * Shows detailed information for a specific booking including:
 * - Booking details and status
 * - File attachments
 * - Messages/communication thread
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/Layout';
import * as api from '../../lib/api';

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
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

/**
 * Formats a message timestamp
 */
const formatMessageTime = (dateStr) => {
  if (!dateStr) return '';
  
  try {
    const date = new Date(dateStr);
    return date.toLocaleString('en-AU', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateStr;
  }
};

/**
 * Gets the file icon based on file type
 */
const getFileIcon = (fileType) => {
  if (fileType?.includes('pdf')) {
    return (
      <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    );
  }
  if (fileType?.includes('image')) {
    return (
      <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
  }
  return (
    <svg className="w-8 h-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
};

// =============================================================================
// COMPONENT
// =============================================================================

export default function BookingDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  // State for booking data
  const [booking, setBooking] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for message form
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState('');

  // State for attachment viewer
  const [viewingAttachment, setViewingAttachment] = useState(null);

  // Fetch booking data on mount
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        // Fetch booking details, attachments, and messages in parallel
        const [bookingRes, attachmentsRes, messagesRes] = await Promise.all([
          api.getBookingById(id),
          api.getBookingAttachments(id),
          api.getBookingMessages(id)
        ]);

        setBooking(bookingRes.booking);
        setAttachments(attachmentsRes.attachments || []);
        setMessages(messagesRes.messages || []);
      } catch (err) {
        setError(err.message || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;

    setSendingMessage(true);
    setMessageError('');

    try {
      const result = await api.sendMessage(id, newMessage.trim());
      
      // Add new message to the list
      setMessages([result.data, ...messages]);
      setNewMessage('');
    } catch (err) {
      setMessageError(err.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Layout title="Loading... | Customer Portal">
        <div className="flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-[--color-text-secondary]">Loading booking details...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error || !booking) {
    return (
      <Layout title="Error | Customer Portal">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Booking Not Found</h2>
            <p className="text-[--color-text-secondary] mb-4">{error || 'The booking you requested could not be found.'}</p>
            <Link href="/" className="btn-primary inline-flex">
              Back to Bookings
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${booking.description} | Customer Portal`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-sm text-[--color-text-secondary] hover:text-white mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Bookings
        </Link>

        {/* Booking header */}
        <div className="card mb-6 animate-fade-in">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <span className={`${getStatusClass(booking.status)} mb-2`}>
                {booking.status}
              </span>
              <h1 className="text-2xl font-bold text-white mt-2">
                {booking.description}
              </h1>
              <p className="text-sm text-[--color-text-secondary] font-mono mt-1">
                {booking.jobNumber}
              </p>
            </div>
            {booking.amount > 0 && (
              <div className="text-right">
                <p className="text-sm text-[--color-text-secondary]">Amount</p>
                <p className="text-2xl font-bold text-accent-400">
                  ${booking.amount.toFixed(2)}
                </p>
              </div>
            )}
          </div>

          {/* Details grid */}
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Address */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-600/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-[--color-text-secondary] uppercase tracking-wider mb-1">Address</p>
                <p className="text-white">{booking.address}</p>
              </div>
            </div>

            {/* Date */}
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-600/10 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-[--color-text-secondary] uppercase tracking-wider mb-1">Scheduled Date</p>
                <p className="text-white">{formatDate(booking.date)}</p>
                {booking.time && <p className="text-sm text-[--color-text-secondary]">{booking.time}</p>}
              </div>
            </div>
          </div>

          {/* Work done description */}
          {booking.workDone && (
            <div className="mt-6 pt-6 border-t border-[--color-border]">
              <h3 className="text-sm font-semibold text-white mb-2">Work Completed</h3>
              <p className="text-[--color-text-secondary]">{booking.workDone}</p>
            </div>
          )}

          {/* Notes */}
          {booking.notes && (
            <div className="mt-4 p-4 rounded-lg bg-[--color-bg-tertiary]">
              <h3 className="text-sm font-semibold text-white mb-2">Notes</h3>
              <p className="text-sm text-[--color-text-secondary]">{booking.notes}</p>
            </div>
          )}
        </div>

        {/* Attachments section */}
        <div className="card mb-6 animate-fade-in stagger-2" style={{ opacity: 0 }}>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
            Attachments
            <span className="text-sm font-normal text-[--color-text-secondary]">
              ({attachments.length})
            </span>
          </h2>

          {attachments.length === 0 ? (
            <p className="text-[--color-text-secondary] text-sm">
              No attachments for this booking.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {attachments.map((attachment) => (
                <div 
                  key={attachment.id}
                  onClick={() => setViewingAttachment(attachment)}
                  className="flex items-center gap-4 p-4 rounded-lg bg-[--color-bg-tertiary] hover:bg-[--color-bg-tertiary]/80 transition-colors cursor-pointer"
                >
                  {getFileIcon(attachment.fileType)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {attachment.fileName}
                    </p>
                    <p className="text-xs text-[--color-text-secondary]">
                      {attachment.description || 'File attachment'}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-[--color-text-secondary]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Messages section */}
        <div className="card animate-fade-in stagger-3" style={{ opacity: 0 }}>
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Messages
          </h2>

          {/* Message form */}
          <form onSubmit={handleSendMessage} className="mb-6">
            {messageError && (
              <div className="mb-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {messageError}
              </div>
            )}
            
            <div className="flex gap-3">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message here..."
                rows={3}
                className="form-input flex-1 resize-none"
                maxLength={2000}
              />
              <button
                type="submit"
                disabled={sendingMessage || !newMessage.trim()}
                className="btn-primary self-end flex items-center gap-2"
              >
                {sendingMessage ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending
                  </>
                ) : (
                  <>
                    Send
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Messages list */}
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[--color-bg-tertiary] flex items-center justify-center">
                <svg className="w-6 h-6 text-[--color-text-secondary]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <p className="text-[--color-text-secondary] text-sm">
                No messages yet. Send a message to start the conversation.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`p-4 rounded-lg ${
                    message.isFromCustomer 
                      ? 'bg-brand-600/10 border border-brand-600/20 ml-8' 
                      : 'bg-[--color-bg-tertiary] mr-8'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white">
                      {message.isFromCustomer ? 'You' : 'Service Team'}
                    </span>
                    <span className="text-xs text-[--color-text-secondary]">
                      {formatMessageTime(message.createdAt)}
                    </span>
                  </div>
                  <p className="text-[--color-text-secondary] whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Attachment Viewer Modal */}
      {viewingAttachment && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setViewingAttachment(null)}
        >
          <div 
            className="bg-[--color-bg-secondary] border border-[--color-border] rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-[--color-border]">
              <div className="flex items-center gap-3">
                {getFileIcon(viewingAttachment.fileType)}
                <div>
                  <h3 className="font-semibold text-white">{viewingAttachment.fileName}</h3>
                  <p className="text-xs text-[--color-text-secondary]">{viewingAttachment.description}</p>
                </div>
              </div>
              <button 
                onClick={() => setViewingAttachment(null)}
                className="p-2 rounded-lg hover:bg-[--color-bg-tertiary] transition-colors"
              >
                <svg className="w-5 h-5 text-[--color-text-secondary]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content - Preview Area */}
            <div className="p-6">
              {viewingAttachment.fileType?.includes('image') || 
               viewingAttachment.fileType?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
               viewingAttachment.fileName?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
               viewingAttachment.description?.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                // Real image preview from ServiceM8
                <div className="flex items-center justify-center bg-[--color-bg-tertiary] rounded-lg overflow-hidden">
                  <img 
                    src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/attachments/${viewingAttachment.id}/view`}
                    alt={viewingAttachment.fileName}
                    className="max-w-full max-h-[400px] object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div className="text-center p-8 hidden">
                    <svg className="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-[--color-text-secondary]">Failed to load image</p>
                  </div>
                </div>
              ) : viewingAttachment.fileType?.includes('pdf') ? (
                // PDF preview
                <div className="flex items-center justify-center bg-[--color-bg-tertiary] rounded-lg p-8">
                  <div className="text-center">
                    <svg className="w-24 h-24 mx-auto text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <p className="text-white font-medium mb-1">{viewingAttachment.fileName}</p>
                    <p className="text-sm text-[--color-text-secondary]">PDF Document</p>
                  </div>
                </div>
              ) : (
                // Generic file preview
                <div className="flex items-center justify-center bg-[--color-bg-tertiary] rounded-lg p-8">
                  <div className="text-center">
                    <svg className="w-24 h-24 mx-auto text-blue-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} 
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-white font-medium mb-1">{viewingAttachment.fileName}</p>
                    <p className="text-sm text-[--color-text-secondary]">File Attachment</p>
                  </div>
                </div>
              )}

              {/* File Info */}
              <div className="mt-4 p-4 rounded-lg bg-[--color-bg-tertiary]">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[--color-text-secondary]">File Name</p>
                    <p className="text-white font-medium">{viewingAttachment.fileName}</p>
                  </div>
                  <div>
                    <p className="text-[--color-text-secondary]">Type</p>
                    <p className="text-white font-medium">{viewingAttachment.fileType || 'Unknown'}</p>
                  </div>
                  <div>
                    <p className="text-[--color-text-secondary]">Created</p>
                    <p className="text-white font-medium">{viewingAttachment.createdDate || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[--color-text-secondary]">Description</p>
                    <p className="text-white font-medium">{viewingAttachment.description || 'No description'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-4 border-t border-[--color-border]">
              <button 
                onClick={() => setViewingAttachment(null)}
                className="btn-secondary"
              >
                Close
              </button>
              <a 
                href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/attachments/${viewingAttachment.id}/download`}
                download={viewingAttachment.fileName}
                className="btn-primary flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </a>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

