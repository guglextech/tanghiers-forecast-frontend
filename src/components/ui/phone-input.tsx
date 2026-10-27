"use client"

import * as React from "react"

import { controlRadius, fieldWithin } from "@/components/ui/field"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type PhoneCountry = {
  code: string
  name: string
  dial?: string
}

const DIAL_BY_COUNTRY: Record<string, string> = {
  US: "1",
  CA: "1",
  GB: "44",
  GH: "233",
  NG: "234",
  KE: "254",
  ZA: "27",
  AU: "61",
  NZ: "64",
  IN: "91",
  DE: "49",
  FR: "33",
  NL: "31",
  IE: "353",
  IT: "39",
  ES: "34",
  AE: "971",
  SG: "65",
}

export function dialCodeFor(countryCode: string, countries: PhoneCountry[] = []) {
  const match = countries.find((country) => country.code === countryCode)
  if (match?.dial) return match.dial.replace(/^\+/, "")
  return DIAL_BY_COUNTRY[countryCode] || "1"
}

export function toE164(countryCode: string, national: string, countries: PhoneCountry[] = []) {
  const digits = national.replace(/\D/g, "").replace(/^0+/, "")
  if (!digits) return ""
  return `+${dialCodeFor(countryCode, countries)}${digits}`
}

export function nationalFromE164(phone: string, countryCode: string, countries: PhoneCountry[] = []) {
  const digits = phone.replace(/\D/g, "")
  const dial = dialCodeFor(countryCode, countries)
  return digits.startsWith(dial) ? digits.slice(dial.length) : digits
}

export function countryFromE164(phone: string, countries: PhoneCountry[] = []) {
  const digits = phone.replace(/\D/g, "")
  const entries = (countries.length ? countries : Object.keys(DIAL_BY_COUNTRY).map((code) => ({
    code,
    name: code,
    dial: DIAL_BY_COUNTRY[code],
  }))).map((country) => ({
    code: country.code,
    dial: dialCodeFor(country.code, countries),
  }))
  entries.sort((a, b) => b.dial.length - a.dial.length)
  return entries.find((entry) => digits.startsWith(entry.dial))?.code
}

export function PhoneInput({
  id,
  countries,
  countryCode,
  onCountryChange,
  value,
  onChange,
  placeholder = "550982043",
  disabled,
}: {
  id?: string
  countries: PhoneCountry[]
  countryCode: string
  onCountryChange: (code: string) => void
  value: string
  onChange: (national: string) => void
  placeholder?: string
  disabled?: boolean
}) {
  const list = countries.length
    ? countries.map((country) => ({
        ...country,
        dial: dialCodeFor(country.code, countries),
      }))
    : Object.entries(DIAL_BY_COUNTRY).map(([code, dial]) => ({
        code,
        name: code,
        dial,
      }))

  return (
    <div className={cn("flex h-9 border border-input bg-transparent", controlRadius, fieldWithin)}>
      <Select value={countryCode} onValueChange={onCountryChange} disabled={disabled}>
        <SelectTrigger
          aria-label="Country code"
          className="h-9 w-[6.75rem] shrink-0 rounded-none border-0 border-r border-input px-2 shadow-none focus:border-transparent focus:shadow-none data-[state=open]:border-transparent data-[state=open]:shadow-none"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {list.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              {country.code} +{country.dial}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/[^\d]/g, ""))}
        className={cn("h-9 rounded-none border-0 shadow-none focus:border-transparent focus:shadow-none")}
      />
    </div>
  )
}
