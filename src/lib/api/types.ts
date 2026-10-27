export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  timestamp?: string;
  statusCode?: number;
  error?: string;
  message?: string | string[];
  code?: string | null;
  path?: string;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type LoginResult = {
  tokens?: AuthTokens;
  accessToken?: string;
  refreshToken?: string;
  mfaRequired?: boolean;
  mfaEnrollmentRequired?: boolean;
  mfaToken?: string;
  signupToken?: string;
  user?: ApiUser;
  recoveryCodes?: string[];
};

export type MfaEnrollStart = {
  secret?: string;
  totpSecret?: string;
  base32?: string;
  otpauthUrl?: string;
  otpauth_uri?: string;
  otpauthUri?: string;
  uri?: string;
  qrCode?: string | null;
  qrCodeDataUrl?: string | null;
  qr?: string | null;
  mfaToken?: string;
  issuer?: string;
  account?: string;
  email?: string;
};

export type ApiUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  role?: string;
  phone?: string | null;
  timezone?: string | null;
  countryCode?: string | null;
  dateOfBirth?: string | null;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  disabled?: boolean;
  enabled?: boolean;
  status?: string;
  subscriptionStatus?: string;
  planCode?: string;
  planId?: string;
  mfaEnabled?: boolean;
  createdAt?: string;
  lastLoginAt?: string | null;
};

export type ApiConsentMap = Record<
  string,
  {
    version: string;
    text: string;
  }
>;

export type ApiPlan = {
  id?: string;
  code?: string;
  name?: string;
  description?: string | null;
  kind?: string;
  interval?: string | null;
  intervalCount?: number;
  passDurationHours?: number | null;
  displayPrices?: Record<string, number>;
  amounts?: Record<string, number>;
  channels?: string[];
  featured?: boolean;
  period?: string;
};

export type ApiForecastBody = {
  banker?: number[];
  twoSure?: number[];
  threeDirect?: number[];
  permutations?: string;
};

export type ApiForecastField = {
  key?: string;
  label?: string;
  type?: string;
  value?: unknown;
};

export type ApiForecastVideo = {
  provider?: string;
  videoId?: string;
  embedUrl?: string;
  watchUrl?: string;
};

export type ApiForecastContent = {
  fields?: ApiForecastField[];
  message?: string | null;
  video?: ApiForecastVideo | null;
};

export type ApiForecast = {
  id: string;
  title?: string;
  drawDate?: string;
  date?: string;
  status?: string;
  publishAt?: string | null;
  publishedAt?: string | null;
  createdAt?: string;
  version?: number;
  videoUrl?: string | null;
  message?: string | null;
  accessLevel?: string;
  body?: ApiForecastBody | null;
  content?: ApiForecastContent | null;
  locked?: boolean;
  hasVideo?: boolean;
};

export type ApiSubscription = {
  id?: string;
  status?: string;
  planCode?: string;
  planId?: string;
  planName?: string;
  currentPeriodEnd?: string | null;
  currentPeriodStart?: string | null;
  createdAt?: string;
  productSlug?: string;
  cancelAtPeriodEnd?: boolean;
};

export type ApiPayment = {
  id?: string;
  date?: string;
  createdAt?: string;
  paidAt?: string | null;
  label?: string;
  description?: string;
  planCode?: string;
  planId?: string;
  planName?: string;
  kind?: string;
  passDurationHours?: number | null;
  amount?: number;
  amountCents?: number;
  amountDue?: number | null;
  amountPaid?: number | null;
  currency?: string;
  status?: string;
  invoiceNumber?: string | null;
  invoiceUrl?: string | null;
  productSlug?: string;
};

export type ApiEntitlement = {
  entitled?: boolean;
  hasAccess?: boolean;
  active?: boolean;
  status?: string;
};

export type ApiNotification = {
  id?: string;
  channel?: string;
  status?: string;
  detail?: string;
  message?: string;
  forecastId?: string;
  userId?: string;
  userEmail?: string;
  email?: string;
  destination?: string;
  errorCode?: string | null;
  errorMessage?: string | null;
  attempts?: number;
  createdAt?: string;
  at?: string;
  sentAt?: string;
  deliveredAt?: string;
  updatedAt?: string;
};

export type Paginated<T> = T[] | { items?: T[]; data?: T[]; results?: T[] };

export type ApiOverviewReport = Record<string, unknown>;

export type ApiProductField = {
  key?: string;
  label?: string;
  type?: string;
  count?: number;
};

export type ApiProductSettings = {
  supportEmail?: string;
  mailingAddress?: string;
  frontendUrls?: {
    verifyEmail?: string;
    resetPassword?: string;
    account?: string;
  };
  branding?: {
    accentColor?: string;
  };
};

export type ApiAdminProduct = {
  slug?: string;
  name?: string;
  timezone?: string;
  minAge?: number;
  supportEmail?: string;
  settings?: ApiProductSettings;
  fields?: ApiProductField[];
  forecastFields?: ApiProductField[];
};
