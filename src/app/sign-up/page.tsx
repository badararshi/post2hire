import { SignUpForm } from '@/components/auth/sign-up-form';
import { Wordmark } from '@/components/layout/wordmark';

export const metadata = { title: 'Sign up' };

export default function SignUpPage() {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <Wordmark size="md" />
        <p className="mt-2 text-sm text-muted">Create your free account</p>
      </div>
      <SignUpForm />
    </div>
  );
}
