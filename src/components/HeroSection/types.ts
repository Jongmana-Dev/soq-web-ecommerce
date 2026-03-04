export interface HeroSectionProps {
  frames?: number
  framePath?: string
  brandName?: string
  tagline?: string
}

export interface ScrollState {
  progress: number
  frameIndex: number
  brandOpacity: number
  brandY: number
  taglineOpacity: number
  triangleScale: number
  sectionOpacity: number
}
