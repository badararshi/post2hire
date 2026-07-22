'use client';

import { useState } from 'react';
import { Turnstile } from '@/components/ui/turnstile';

export function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [turnstileToken, setTurnstileToken] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message, website, turnstileToken }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Could not send your message.');
        setStatus('error');
        return;
      }
      setStatus('sent');
    } catch {
      setError('Network error. Please try again.');
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="card">
        <p className="text-sm text-ink">Thanks — your message has been sent. We'll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      {error && (
        <p role="alert" className="rounded-card bg-red-50 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}
      {/* Honeypot — hidden from real users via CSS, bots often fill it in */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        className="absolute -left-[9999px]"
        aria-hidden="true"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-ink">Name</label>
          <input id="name" required className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">Email</label>
          <input id="email" type="email" required className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>
      <div>
        <label htmlFor="subject" className="mb-1.5 block text-sm font-medium text-ink">Subject</label>
        <input id="subject" required className="input-field" value={subject} onChange={(e) => setSubject(e.target.value)} />
      </div>
      <div>
        <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-ink">Message</label>
        <textarea id="message" required rows={6} className="input-field" value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>
      <Turnstile onToken={setTurnstileToken} />
      <button type="submit" disabled={status === 'sending'} className="btn-primary w-full">
        {status === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
