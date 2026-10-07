export type QuoteSpacing = 'always' | 'never'

export interface QuoteOptions {
  halfwidth: QuoteSpacing
  fullwidth: QuoteSpacing
}

export interface QuoteEdit {
  start: number
  end: number
  text: string
}

export interface QuoteMark {
  char: string
  offset: number
}

export interface QuoteGroup {
  open: QuoteMark
  close: QuoteMark
  fullwidth: boolean
}

export interface QuoteStyle {
  fullwidth: boolean
  open: string
  close: string
}

export type QuoteSide = 'before' | 'after'

export interface QuoteBoundary {
  start: number
  end: number
  neighbor: string
}

export interface QuoteBoundaryOptions {
  side: QuoteSide
  limit: number
}

export interface ExternalSpaceOptions {
  side: QuoteSide
  spacing: QuoteOptions
}

export interface AddEditOptions {
  start: number
  end: number
  text: string
}

export interface QuoteMarkEditsOptions {
  source: string
  style: QuoteStyle
}

export interface OuterSpacingEditOptions {
  source: string
  side: QuoteSide
  limit: number
  style: QuoteStyle
  spacing: QuoteOptions
}

export interface AnalyzeQuoteSpacingOptions {
  parentStart: number
  parentEnd: number
  spacing: QuoteOptions
}
