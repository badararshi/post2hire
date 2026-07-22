import { ContactForm } from '@/components/contact-form';

export const metadata = { title: 'Contact' };

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-content px-4 py-10 sm:py-14">
      <h1 className="font-display text-2xl font-bold text-ink sm:text-3xl">Contact us</h1>
      <p className="mt-2 text-muted">Questions, feedback, or issues — we'd like to hear from you.</p>
      <div className="mt-8">
        <ContactForm />
      </div>
    </div>
  );
}
