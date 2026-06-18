export type SortField = 'Attack' | 'Defense' | 'Level' | 'Stars'
export type SortDir = 'asc' | 'desc'
export type ViewMode = 'grid' | 'table'

export interface FilterState {
  sortField: SortField
  sortDir: SortDir
  viewMode: ViewMode
  minAtk: number
  minDef: number
  filterType: number[] | null
  filterAttr: number | null
  minStars: number
  maxStars: number
}

export const DEFAULT_FILTERS: FilterState = {
  sortField: 'Attack', sortDir: 'desc', viewMode: 'grid',
  minAtk: 0, minDef: 0, filterType: null, filterAttr: null,
  minStars: 0, maxStars: 999,
}

const VALID_FIELDS: SortField[] = ['Attack', 'Defense', 'Level', 'Stars']

export function parseFilters(
  get: (k: string) => string | null,
  has: (k: string) => boolean,
  getAll: (k: string) => string[] = () => [],
): FilterState {
  const sortRaw = get('sort') || ''
  const [sf, sd] = sortRaw.split(':')
  const fTypeRaw = getAll('fType').map(Number).filter(n => !isNaN(n))
  return {
    sortField: VALID_FIELDS.includes(sf as SortField) ? (sf as SortField) : 'Attack',
    sortDir: sd === 'asc' ? 'asc' : 'desc',
    viewMode: get('view') === 'table' ? 'table' : 'grid',
    minAtk: Math.max(0, Number(get('minAtk')) || 0),
    minDef: Math.max(0, Number(get('minDef')) || 0),
    filterType: fTypeRaw.length > 0 ? fTypeRaw : null,
    filterAttr: has('fAttr') ? Number(get('fAttr')) : null,
    minStars: Math.max(0, Number(get('minStar')) || 0),
    maxStars: has('maxStar') ? Math.max(0, Number(get('maxStar'))) : 999,
  }
}

export function applyFilters(base: URLSearchParams, f: FilterState): URLSearchParams {
  const p = new URLSearchParams(base.toString())
  if (f.sortField === 'Attack' && f.sortDir === 'desc') p.delete('sort')
  else p.set('sort', `${f.sortField}:${f.sortDir}`)
  if (f.viewMode === 'grid') p.delete('view'); else p.set('view', 'table')
  if (f.minAtk > 0) p.set('minAtk', String(f.minAtk)); else p.delete('minAtk')
  if (f.minDef > 0) p.set('minDef', String(f.minDef)); else p.delete('minDef')
  p.delete('fType')
  if (f.filterType !== null && f.filterType.length > 0) {
    for (const t of f.filterType) p.append('fType', String(t))
  }
  if (f.filterAttr !== null) p.set('fAttr', String(f.filterAttr)); else p.delete('fAttr')
  if (f.minStars > 0) p.set('minStar', String(f.minStars)); else p.delete('minStar')
  if (f.maxStars < 999) p.set('maxStar', String(f.maxStars)); else p.delete('maxStar')
  return p
}
