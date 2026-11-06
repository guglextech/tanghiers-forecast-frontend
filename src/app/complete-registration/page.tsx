import { Suspense } from 'react';
import { RegistrationForm } from '@/components/auth/registration-form';

export default function CompleteRegistrationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white px-4">
          <p className="text-sm text-[#667085]">Loading…</p>
        </div>
      }
    >
      <RegistrationForm />
    </Suspense>
  );
}
