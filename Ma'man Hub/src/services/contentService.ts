import api from './api';

// ── Age group types ───────────────────────────────────────────────────────────

export type AgeGroup =
  | 'ForParents'
  | 'ForEducators'
  | 'Toddlers'
  | 'Preschool'
  | 'EarlyPrimary'
  | 'LatePrimary'
  | 'Tweens'
  | 'Teenagers';

export const AGE_GROUP_FROM_INT: Record<number, AgeGroup> = {
  0: 'ForParents',
  1: 'ForEducators',
  2: 'Toddlers',
  3: 'Preschool',
  4: 'EarlyPrimary',
  5: 'LatePrimary',
  6: 'Tweens',
  7: 'Teenagers',
};

export interface AgeGroupMeta {
  value:       AgeGroup;
  label:       string;
  ageRange:    string;
  color:       string;
  textColor:   string;
  borderColor: string;
}

export const AGE_GROUPS: AgeGroupMeta[] = [
  { value: 'ForParents',   label: 'For Parents',   ageRange: 'All ages',  color: 'bg-rose-100',   textColor: 'text-rose-700',   borderColor: 'border-rose-300'   },
  { value: 'ForEducators', label: 'For Educators', ageRange: 'All ages',  color: 'bg-violet-100', textColor: 'text-violet-700', borderColor: 'border-violet-300' },
  { value: 'Toddlers',     label: 'Toddlers',      ageRange: '1–3 yrs',   color: 'bg-yellow-100', textColor: 'text-yellow-700', borderColor: 'border-yellow-300' },
  { value: 'Preschool',    label: 'Preschool',     ageRange: '3–5 yrs',   color: 'bg-green-100',  textColor: 'text-green-700',  borderColor: 'border-green-300'  },
  { value: 'EarlyPrimary', label: 'Early Primary', ageRange: '5–8 yrs',   color: 'bg-blue-100',   textColor: 'text-blue-700',   borderColor: 'border-blue-300'   },
  { value: 'LatePrimary',  label: 'Late Primary',  ageRange: '8–12 yrs',  color: 'bg-cyan-100',   textColor: 'text-cyan-700',   borderColor: 'border-cyan-300'   },
  { value: 'Tweens',       label: 'Tweens',        ageRange: '10–13 yrs', color: 'bg-orange-100', textColor: 'text-orange-700', borderColor: 'border-orange-300' },
  { value: 'Teenagers',    label: 'Teenagers',     ageRange: '13–18 yrs', color: 'bg-indigo-100', textColor: 'text-indigo-700', borderColor: 'border-indigo-300' },
];

export function getAgeGroupMeta(value: AgeGroup): AgeGroupMeta {
  return AGE_GROUPS.find(g => g.value === value) ?? AGE_GROUPS[0];
}

export function resolveAgeGroup(value: AgeGroup | number | string): AgeGroup | null {
  if (typeof value === 'number') return AGE_GROUP_FROM_INT[value] ?? null;
  const known = Object.values(AGE_GROUP_FROM_INT);
  return known.includes(value as AgeGroup) ? (value as AgeGroup) : null;
}

// ── CourseDto — matches backend GetCoursesDto exactly ────────────────────────

export interface CourseDto {
  id:                   string;
  title:                string;
  instructorId:         string;
  instructorName:       string;
  instructorAvatarUrl?: string;
  categoryId:           string;
  categoryName:         string;
  ageGroup:             number;
  price:                number;
  discountPrice?:       number | null;
  rating:               number;
  totalStudents:        number;
  durationHours:        number;
  thumbnailUrl:         string;
  language:             string;
  lastUpdated?:         string;
  isInWishlist:         boolean;
  isInCart:             boolean;
}

// ── Paging ────────────────────────────────────────────────────────────────────

export interface PagedResult<T> {
  items:           T[];
  totalCount:      number;
  page:            number;
  pageSize:        number;
  totalPages:      number;
  hasPreviousPage: boolean;
  hasNextPage:     boolean;
}

export interface GetCoursesParams {
  categoryId?:  string;
  ageGroup?:    AgeGroup;
  minPrice?:    number;
  maxPrice?:    number;
  minRating?:   number;
  language?:    string;
  searchQuery?: string;
  sortBy?:      string;
  sortOrder?:   string;
  page?:        number;
  pageSize?:    number;
}

export interface ApiResponse<T> {
  data:    T;
  success: boolean;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const contentService = {
  getCourses: async (params: GetCoursesParams = {}): Promise<PagedResult<CourseDto>> => {
    const {
      categoryId, ageGroup, minPrice, maxPrice, minRating,
      language, searchQuery,
      sortBy = 'relevance', sortOrder = 'desc',
      page = 1, pageSize = 12,
    } = params;

    const q = new URLSearchParams();

    if (categoryId) q.set('categoryId', categoryId);

    if (ageGroup) {
      const intVal = Object.entries(AGE_GROUP_FROM_INT)
        .find(([, v]) => v === ageGroup)?.[0];
      if (intVal != null) q.set('ageGroup', intVal);
    }

    if (minPrice != null)  q.set('minPrice',    String(minPrice));
    if (maxPrice != null)  q.set('maxPrice',    String(maxPrice));
    if (minRating != null) q.set('minRating',   String(minRating));
    if (language)          q.set('language',    language);
    if (searchQuery)       q.set('searchQuery', searchQuery);

    q.set('sortBy',    sortBy);
    q.set('sortOrder', sortOrder);
    q.set('page',      String(page));
    q.set('pageSize',  String(pageSize));

    const res = await api.get<ApiResponse<PagedResult<CourseDto>>>(`/Course?${q.toString()}`);
    return res.data.data;
  },
};