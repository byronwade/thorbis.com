/**
 * Multi-Currency and Internationalization Support
 * 
 * Provides comprehensive i18n support with multi-currency handling,
 * localization, and regional business rule compliance
 */

import { executeQuery } from './database'
import { cache } from './cache'

// Supported currencies
export enum Currency {'
  USD = 'USD','
  EUR = 'EUR','
  GBP = 'GBP','
  CAD = 'CAD','
  AUD = 'AUD','
  JPY = 'JPY','
  CHF = 'CHF','
  CNY = 'CNY','
  INR = 'INR','
  BRL = 'BRL','
  MXN = 'MXN','
  ZAR = 'ZAR','
  SGD = 'SGD','
  HKD = 'HKD','
  SEK = 'SEK','
  NOK = 'NOK','
  DKK = 'DKK','
  PLN = 'PLN','
  CZK = 'CZK','
  HUF = 'HUF'
}

// Supported locales
export enum Locale {
  EN_US = 'en-US','
  EN_GB = 'en-GB','
  EN_CA = 'en-CA','
  EN_AU = 'en-AU','
  ES_ES = 'es-ES','
  ES_MX = 'es-MX','
  FR_FR = 'fr-FR','
  FR_CA = 'fr-CA','
  DE_DE = 'de-DE','
  IT_IT = 'it-IT','
  PT_BR = 'pt-BR','
  PT_PT = 'pt-PT','
  NL_NL = 'nl-NL','
  SV_SE = 'sv-SE','
  NO_NO = 'no-NO','
  DA_DK = 'da-DK','
  FI_FI = 'fi-FI','
  PL_PL = 'pl-PL','
  CS_CZ = 'cs-CZ','
  HU_HU = 'hu-HU','
  RU_RU = 'ru-RU','
  ZH_CN = 'zh-CN','
  ZH_TW = 'zh-TW','
  JA_JP = 'ja-JP','
  KO_KR = 'ko-KR','
  HI_IN = 'hi-IN','
  AR_SA = 'ar-SA','
  HE_IL = 'he-IL','
  TH_TH = 'th-TH','
  VI_VN = 'vi-VN'
}

// Time zones
export enum TimeZone {
  UTC = 'UTC','
  AMERICA_NEW_YORK = 'America/New_York','
  AMERICA_CHICAGO = 'America/Chicago','
  AMERICA_DENVER = 'America/Denver','
  AMERICA_LOS_ANGELES = 'America/Los_Angeles','
  AMERICA_TORONTO = 'America/Toronto','
  AMERICA_VANCOUVER = 'America/Vancouver','
  AMERICA_SAO_PAULO = 'America/Sao_Paulo','
  AMERICA_MEXICO_CITY = 'America/Mexico_City','
  EUROPE_LONDON = 'Europe/London','
  EUROPE_PARIS = 'Europe/Paris','
  EUROPE_BERLIN = 'Europe/Berlin','
  EUROPE_ROME = 'Europe/Rome','
  EUROPE_MADRID = 'Europe/Madrid','
  EUROPE_AMSTERDAM = 'Europe/Amsterdam','
  EUROPE_STOCKHOLM = 'Europe/Stockholm','
  EUROPE_OSLO = 'Europe/Oslo','
  EUROPE_COPENHAGEN = 'Europe/Copenhagen','
  EUROPE_HELSINKI = 'Europe/Helsinki','
  ASIA_TOKYO = 'Asia/Tokyo','
  ASIA_SHANGHAI = 'Asia/Shanghai','
  ASIA_HONG_KONG = 'Asia/Hong_Kong','
  ASIA_SINGAPORE = 'Asia/Singapore','
  ASIA_MUMBAI = 'Asia/Kolkata','
  ASIA_DUBAI = 'Asia/Dubai','
  AUSTRALIA_SYDNEY = 'Australia/Sydney','
  AUSTRALIA_MELBOURNE = 'Australia/Melbourne','
  PACIFIC_AUCKLAND = 'Pacific/Auckland'
}

// Currency exchange rate
interface ExchangeRate {
  from: Currency
  to: Currency
  rate: number
  timestamp: Date
  source: string
}

// Localization context
interface LocalizationContext {
  locale: Locale
  currency: Currency
  timeZone: TimeZone
  dateFormat: string
  timeFormat: string
  numberFormat: Intl.NumberFormatOptions
  currencyFormat: Intl.NumberFormatOptions
  rtl: boolean
}

// Business configuration per locale
interface LocaleBusinessRules {
  locale: Locale
  taxCalculation: 'inclusive' | 'exclusive'
  invoiceRequiredFields: string[]
  paymentMethods: string[]
  businessHours: {
    [key: string]: { start: string; end: string }
  }
  holidays: string[]
  complianceRules: string[]
}

// Default locale configurations
const LOCALE_CONFIGS: Record<Locale, LocalizationContext> = {
  [Locale.EN_US]: {
    locale: Locale.EN_US,
    currency: Currency.USD,
    timeZone: TimeZone.AMERICA_NEW_YORK,
    dateFormat: 'MM/dd/yyyy','
    timeFormat: 'h:mm a','
    numberFormat: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
    currencyFormat: { style: 'currency', currency: 'USD' },'
    rtl: false
  },
  [Locale.EN_GB]: {
    locale: Locale.EN_GB,
    currency: Currency.GBP,
    timeZone: TimeZone.EUROPE_LONDON,
    dateFormat: 'dd/MM/yyyy','
    timeFormat: 'HH:mm','
    numberFormat: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
    currencyFormat: { style: 'currency', currency: 'GBP' },'
    rtl: false
  },
  [Locale.ES_ES]: {
    locale: Locale.ES_ES,
    currency: Currency.EUR,
    timeZone: TimeZone.EUROPE_MADRID,
    dateFormat: 'dd/MM/yyyy','
    timeFormat: 'HH:mm','
    numberFormat: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
    currencyFormat: { style: 'currency', currency: 'EUR' },'
    rtl: false
  },
  [Locale.FR_FR]: {
    locale: Locale.FR_FR,
    currency: Currency.EUR,
    timeZone: TimeZone.EUROPE_PARIS,
    dateFormat: 'dd/MM/yyyy','
    timeFormat: 'HH:mm','
    numberFormat: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
    currencyFormat: { style: 'currency', currency: 'EUR' },'
    rtl: false
  },
  [Locale.DE_DE]: {
    locale: Locale.DE_DE,
    currency: Currency.EUR,
    timeZone: TimeZone.EUROPE_BERLIN,
    dateFormat: 'dd.MM.yyyy','
    timeFormat: 'HH:mm','
    numberFormat: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
    currencyFormat: { style: 'currency', currency: 'EUR' },'
    rtl: false
  },
  [Locale.JA_JP]: {
    locale: Locale.JA_JP,
    currency: Currency.JPY,
    timeZone: TimeZone.ASIA_TOKYO,
    dateFormat: 'yyyy/MM/dd','
    timeFormat: 'HH:mm','
    numberFormat: { minimumFractionDigits: 0, maximumFractionDigits: 0 },
    currencyFormat: { style: 'currency', currency: 'JPY' },'
    rtl: false
  },
  [Locale.ZH_CN]: {
    locale: Locale.ZH_CN,
    currency: Currency.CNY,
    timeZone: TimeZone.ASIA_SHANGHAI,
    dateFormat: 'yyyy/MM/dd','
    timeFormat: 'HH:mm','
    numberFormat: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
    currencyFormat: { style: 'currency', currency: 'CNY' },'
    rtl: false
  },
  [Locale.AR_SA]: {
    locale: Locale.AR_SA,
    currency: Currency.USD, // Most businesses in SA use USD
    timeZone: TimeZone.ASIA_DUBAI,
    dateFormat: 'dd/MM/yyyy','
    timeFormat: 'HH:mm','
    numberFormat: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
    currencyFormat: { style: 'currency', currency: 'USD' },'
    rtl: true
  },
  // Add other locales with default configurations
} as Record<Locale, LocalizationContext>

// Currency exchange service
export class CurrencyExchangeService {
  private exchangeRates = new Map<string, ExchangeRate>()
  private lastUpdate = new Date(0)
  private updateInterval = 60 * 60 * 1000 // 1 hour

  /**
   * Get current exchange rate between two currencies
   */
  async getExchangeRate(from: Currency, to: Currency): Promise<number> {
    if (from === to) return 1

    const cacheKey = 'exchange_rate_${from}_${to}'
    const cached = await cache.get(cacheKey)
    
    if (cached && typeof cached === 'number') {'``
      return cached
    }

    // Check if we need to update rates
    if (Date.now() - this.lastUpdate.getTime() > this.updateInterval) {
      await this.updateExchangeRates()
    }

    const rate = this.exchangeRates.get(`${from}-${to}')
    if (rate) {
      await cache.set(cacheKey, rate.rate, 3600) // Cache for 1 hour
      return rate.rate
    }

    // Try reverse rate
    const reverseRate = this.exchangeRates.get('${to}-${from}')
    if (reverseRate) {
      const convertedRate = 1 / reverseRate.rate
      await cache.set(cacheKey, convertedRate, 3600)
      return convertedRate
    }

    // Default to 1 if no rate found (shouldn't happen in production)'
    return 1
  }

  /**
   * Convert amount from one currency to another
   */
  async convertCurrency(amount: number, from: Currency, to: Currency): Promise<number> {
    const rate = await this.getExchangeRate(from, to)
    return amount * rate
  }

  /**
   * Update exchange rates from external service
   */
  private async updateExchangeRates(): Promise<void> {
    try {
      // Mock implementation - in production, integrate with services like:
      // - fixer.io
      // - exchangerate-api.com
      // - currencylayer.com
      // - European Central Bank
      
      const mockRates: ExchangeRate[] = [
        { from: Currency.USD, to: Currency.EUR, rate: 0.85, timestamp: new Date(), source: 'mock' },'
        { from: Currency.USD, to: Currency.GBP, rate: 0.75, timestamp: new Date(), source: 'mock' },'
        { from: Currency.USD, to: Currency.CAD, rate: 1.25, timestamp: new Date(), source: 'mock' },'
        { from: Currency.USD, to: Currency.JPY, rate: 110.0, timestamp: new Date(), source: 'mock' },'
        { from: Currency.USD, to: Currency.CNY, rate: 6.8, timestamp: new Date(), source: 'mock' },'
        { from: Currency.EUR, to: Currency.GBP, rate: 0.88, timestamp: new Date(), source: 'mock' },'`'
        // Add more rates as needed
      ]

      // Store rates in memory
      for (const rate of mockRates) {
        this.exchangeRates.set('${rate.from}-${rate.to}', rate)
      }

      this.lastUpdate = new Date()

      console.log('Exchange rates updated successfully')'

    } catch (error) {
      console.error('Failed to update exchange rates:', error)
    }
  }

  /**
   * Get supported currencies
   */
  getSupportedCurrencies(): Currency[] {
    return Object.values(Currency)
  }

  /**
   * Format currency amount for display
   */
  formatCurrency(amount: number, currency: Currency, locale: Locale): string {
    const config = LOCALE_CONFIGS[locale]
    if (!config) {
      // Default to US formatting
      return new Intl.NumberFormat('en-US', {'
        style: 'currency','
        currency
      }).format(amount)
    }

    return new Intl.NumberFormat(locale, {
      style: 'currency','`'
      currency
    }).format(amount)
  }
}

// Internationalization service
export class InternationalizationService {
  private translations = new Map<string, Record<string, string>>()
  private localeRules = new Map<Locale, LocaleBusinessRules>()

  constructor() {
    this.loadTranslations()
    this.loadLocaleRules()
  }

  /**
   * Get localization context for locale
   */
  getLocalizationContext(locale: Locale): LocalizationContext {
    return LOCALE_CONFIGS[locale] || LOCALE_CONFIGS[Locale.EN_US]
  }

  /**
   * Translate text key for specific locale
   */
  translate(key: string, locale: Locale, variables?: Record<string, string>): string {
    const localeTranslations = this.translations.get(locale) || this.translations.get(Locale.EN_US)
    let translation = localeTranslations?.[key] || key

    // Replace variables
    if (variables) {
      Object.entries(variables).forEach(([variable, value]) => {
        translation = translation.replace('{{${variable}}}', value)
      })
    }

    return translation
  }

  /**
   * Format date for locale
   */
  formatDate(date: Date, locale: Locale, options?: Intl.DateTimeFormatOptions): string {
    const context = this.getLocalizationContext(locale)
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric','
      month: '2-digit','
      day: '2-digit','
      timeZone: context.timeZone
    }

    return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(date)
  }

  /**
   * Format time for locale
   */
  formatTime(date: Date, locale: Locale, options?: Intl.DateTimeFormatOptions): string {
    const context = this.getLocalizationContext(locale)
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      hour: '2-digit','
      minute: '2-digit','
      timeZone: context.timeZone
    }

    return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(date)
  }

  /**
   * Format number for locale
   */
  formatNumber(number: number, locale: Locale, options?: Intl.NumberFormatOptions): string {
    const context = this.getLocalizationContext(locale)
    return new Intl.NumberFormat(locale, { ...context.numberFormat, ...options }).format(number)
  }

  /**
   * Get business rules for locale
   */
  getBusinessRules(locale: Locale): LocaleBusinessRules | null {
    return this.localeRules.get(locale) || null
  }

  /**
   * Check if locale uses RTL text direction
   */
  isRTL(locale: Locale): boolean {
    const context = this.getLocalizationContext(locale)
    return context.rtl
  }

  /**
   * Get supported locales
   */
  getSupportedLocales(): Locale[] {
    return Object.values(Locale)
  }

  /**
   * Detect locale from request headers
   */
  detectLocale(acceptLanguage?: string): Locale {
    if (!acceptLanguage) return Locale.EN_US

    const languages = acceptLanguage
      .split(',')'
      .map(lang => {
        const [language, quality = '1'] = lang.trim().split(';q=')'
        return { language: language.toLowerCase(), quality: parseFloat(quality) }
      })
      .sort((a, b) => b.quality - a.quality)

    for (const { language } of languages) {
      // Try exact match first
      const exactMatch = Object.values(Locale).find(
        locale => locale.toLowerCase() === language
      )
      if (exactMatch) return exactMatch

      // Try language prefix match
      const languageCode = language.split('-')[0]'
      const prefixMatch = Object.values(Locale).find(
        locale => locale.toLowerCase().startsWith(languageCode)
      )
      if (prefixMatch) return prefixMatch
    }

    return Locale.EN_US
  }

  /**
   * Load translations from database or files
   */
  private async loadTranslations(): Promise<void> {
    // Mock translations - in production, load from database or translation files
    const translations: Record<Locale, Record<string, string>> = {
      [Locale.EN_US]: {
        'common.save': 'Save','
        'common.cancel': 'Cancel','
        'common.delete': 'Delete','
        'common.edit': 'Edit','
        'common.add': 'Add','
        'common.search': 'Search','
        'common.loading': 'Loading...','
        'validation.required': 'This field is required','
        'validation.email': 'Please enter a valid email address','
        'validation.phone': 'Please enter a valid phone number','
        'invoice.title': 'Invoice','
        'invoice.date': 'Invoice Date','
        'invoice.due_date': 'Due Date','
        'invoice.total': 'Total','
        'customer.name': 'Customer Name','
        'customer.email': 'Email Address','
        'customer.phone': 'Phone Number'
      },
      [Locale.ES_ES]: {
        'common.save': 'Guardar','
        'common.cancel': 'Cancelar','
        'common.delete': 'Eliminar','
        'common.edit': 'Editar','
        'common.add': 'Añadir','
        'common.search': 'Buscar','
        'common.loading': 'Cargando...','
        'validation.required': 'Este campo es obligatorio','
        'validation.email': 'Por favor ingrese un correo electrónico válido','
        'validation.phone': 'Por favor ingrese un número de teléfono válido','
        'invoice.title': 'Factura','
        'invoice.date': 'Fecha de Factura','
        'invoice.due_date': 'Fecha de Vencimiento','
        'invoice.total': 'Total','
        'customer.name': 'Nombre del Cliente','
        'customer.email': 'Correo Electrónico','
        'customer.phone': 'Número de Teléfono'
      },
      [Locale.FR_FR]: {
        'common.save': 'Enregistrer','
        'common.cancel': 'Annuler','
        'common.delete': 'Supprimer','
        'common.edit': 'Modifier','
        'common.add': 'Ajouter','
        'common.search': 'Rechercher','
        'common.loading': 'Chargement...','
        'validation.required': 'Ce champ est requis','
        'validation.email': 'Veuillez saisir une adresse e-mail valide','
        'validation.phone': 'Veuillez saisir un numéro de téléphone valide','
        'invoice.title': 'Facture','
        'invoice.date': 'Date de Facture','
        'invoice.due_date': 'Date d\'Échéance','
        'invoice.total': 'Total','
        'customer.name': 'Nom du Client','
        'customer.email': 'Adresse E-mail','
        'customer.phone': 'Numéro de Téléphone'
      }
      // Add more languages as needed
    } as Record<Locale, Record<string, string>>

    // Store translations
    Object.entries(translations).forEach(([locale, translation]) => {
      this.translations.set(locale as Locale, translation)
    })
  }

  /**
   * Load locale-specific business rules
   */
  private loadLocaleRules(): void {
    // Mock business rules - in production, load from database
    const rules: Record<Locale, LocaleBusinessRules> = {
      [Locale.EN_US]: {
        locale: Locale.EN_US,
        taxCalculation: 'exclusive','
        invoiceRequiredFields: ['customer_name', 'date', 'items', 'total'],'
        paymentMethods: ['cash', 'credit_card', 'bank_transfer', 'check', 'paypal'],'
        businessHours: {
          monday: { start: '09:00', end: '17:00' },'
          tuesday: { start: '09:00', end: '17:00' },'
          wednesday: { start: '09:00', end: '17:00' },'
          thursday: { start: '09:00', end: '17:00' },'
          friday: { start: '09:00', end: '17:00' }'
        },
        holidays: ['2025-01-01', '2025-07-04', '2025-12-25'],'
        complianceRules: ['sales_tax', 'data_privacy']'
      },
      [Locale.DE_DE]: {
        locale: Locale.DE_DE,
        taxCalculation: 'inclusive','
        invoiceRequiredFields: ['customer_name', 'customer_address', 'date', 'items', 'tax', 'total', 'vat_number'],'
        paymentMethods: ['cash', 'bank_transfer', 'sepa_direct_debit'],'
        businessHours: {
          monday: { start: '08:00', end: '18:00' },'
          tuesday: { start: '08:00', end: '18:00' },'
          wednesday: { start: '08:00', end: '18:00' },'
          thursday: { start: '08:00', end: '18:00' },'
          friday: { start: '08:00', end: '16:00' }'
        },
        holidays: ['2025-01-01', '2025-05-01', '2025-10-03', '2025-12-25', '2025-12-26'],'
        complianceRules: ['vat', 'gdpr', 'invoice_numbering']'
      }
      // Add more locales as needed
    }

    Object.entries(rules).forEach(([locale, rule]) => {
      this.localeRules.set(locale as Locale, rule)
    })
  }
}

// Multi-currency money type
export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: Currency
  ) {}

  /**
   * Convert to another currency
   */
  async convertTo(targetCurrency: Currency, exchangeService: CurrencyExchangeService): Promise<Money> {
    if (this.currency === targetCurrency) {
      return this
    }

    const convertedAmount = await exchangeService.convertCurrency(
      this.amount,
      this.currency,
      targetCurrency
    )

    return new Money(convertedAmount, targetCurrency)
  }

  /**
   * Add money (same currency only)
   */
  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot add money with different currencies')
    }
    return new Money(this.amount + other.amount, this.currency)
  }

  /**
   * Subtract money (same currency only)
   */
  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('Cannot subtract money with different currencies')
    }
    return new Money(this.amount - other.amount, this.currency)
  }

  /**
   * Multiply by a factor
   */
  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency)
  }

  /**
   * Divide by a factor
   */
  divide(factor: number): Money {
    if (factor === 0) {
      throw new Error('Cannot divide by zero')
    }
    return new Money(this.amount / factor, this.currency)
  }

  /**
   * Format for display
   */
  format(locale: Locale, i18nService: InternationalizationService): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency','`'
      currency: this.currency
    }).format(this.amount)
  }

  /**
   * Check if equal to another money
   */
  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      amount: this.amount,
      currency: this.currency
    }
  }

  /**
   * Create from JSON
   */
  static fromJSON(json: { amount: number; currency: Currency }): Money {
    return new Money(json.amount, json.currency)
  }
}

// Global instances
export const currencyService = new CurrencyExchangeService()
export const i18nService = new InternationalizationService()

// Utility functions
export function createMoney(amount: number, currency: Currency): Money {
  return new Money(amount, currency)
}

export function detectUserLocale(acceptLanguage?: string): Locale {
  return i18nService.detectLocale(acceptLanguage)
}

export function getSupportedLocales(): Locale[] {
  return i18nService.getSupportedLocales()
}

export function getSupportedCurrencies(): Currency[] {
  return currencyService.getSupportedCurrencies()
}

// Export types and constants
export {
  Currency,
  Locale,
  TimeZone,
  LocalizationContext,
  LocaleBusinessRules,
  ExchangeRate
}