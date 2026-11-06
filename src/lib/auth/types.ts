export type GoogleAuthClientStatus =
  | 'authenticated'
  | 'signup_required'
  | 'mfa_required'
  | 'error';

export type GoogleAuthClientResponse = {
  status: GoogleAuthClientStatus;
  message?: string;
  code?: string | null;
  email?: string;
  firstName?: string;
  lastName?: string;
  mfaToken?: string;
  mfaEnrollmentRequired?: boolean;
  /** Present only when the upstream issued session tokens. Used by the existing client session layer. */
  tokens?: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    accessTokenExpiresIn?: number;
    refreshTokenExpiresIn?: number;
  };
};
