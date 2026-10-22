/** Shared radius for text fields, selects, and OTP boxes. */
export const FORM_RADIUS = 'rounded-md';

/** Default shadcn Input size — h-9, used across form controls. */
export const FORM_CONTROL =
  `h-9 ${FORM_RADIUS} border border-input bg-background text-base shadow-none transition-colors md:text-sm`;

export const FORM_CONTROL_FOCUS =
  'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50';

export const FORM_LABEL = 'text-xs font-medium text-foreground/80';

export const FORM_HINT = 'text-xs leading-relaxed text-muted-foreground';

export const FORM_SECTION_GAP = 'space-y-4';

/** Option / chip rows that should match the default input height. */
export const FORM_OPTION =
  `min-h-9 ${FORM_RADIUS} border border-input bg-background text-sm transition-colors`;

/** Compact filter pill used on lists (transactions, etc.). */
export const FILTER_PILL =
  'h-8 w-auto min-w-[8.25rem] rounded-full px-3.5 text-sm shadow-none';
