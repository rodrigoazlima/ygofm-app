export interface Card {
  Id: number
  Name: string
  Type: number
  Attack: number
  Defense: number
  Level: number
  Attribute: number
  GuardianStarA: number
  GuardianStarB: number
  CardCode: string
  Description: string
  Stars: number
  Equip: number[] | null
  Fusions: unknown[]
  Ritual: unknown | null
  NameColor: number
  DescColor: number
}

export interface FusionEntry {
  card: number
  result: number
}

export interface ResultEntry {
  card1: number
  card2: number
}

export type FusionsList = (FusionEntry[] | null)[]
export type ResultsList = (ResultEntry[] | null)[]
