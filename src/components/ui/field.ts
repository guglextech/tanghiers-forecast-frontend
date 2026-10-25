/** Blue focus ring shared by text fields, selects, dates, and code boxes. */
export const fieldFocus =
  "transition duration-150 focus:border-[var(--field-ring)] focus:shadow-[var(--field-shadow)] aria-invalid:focus:border-destructive aria-invalid:focus:shadow-[var(--field-shadow-invalid)]";

export const fieldOpen =
  "data-[state=open]:border-[var(--field-ring)] data-[state=open]:shadow-[var(--field-shadow)]";

export const fieldWithin =
  "transition duration-150 focus-within:border-[var(--field-ring)] focus-within:shadow-[var(--field-shadow)]";

export const fieldActive =
  "data-[active=true]:border-[var(--field-ring)] data-[active=true]:shadow-[var(--field-shadow)]";
