'use client';

import { GoogleLogin } from '@react-oauth/google';
import { cn } from '@/lib/utils';

export function GoogleContinueButton({
  onSuccess,
  onError,
  className,
}: {
  onSuccess: (idToken: string) => void;
  onError?: (message: string) => void;
  className?: string;
}) {
  return (
    <div className={cn('flex w-full justify-center [&>div]:w-full', className)}>
      <GoogleLogin
        onSuccess={(response) => {
          if (response.credential) {
            onSuccess(response.credential);
            return;
          }
          onError?.('Google did not return an ID token.');
        }}
        onError={() => onError?.('Could not continue with Google.')}
        text="continue_with"
        theme="outline"
        size="large"
        shape="rectangular"
        width="400"
        use_fedcm_for_button
        context="signin"
      />
    </div>
  );
}
