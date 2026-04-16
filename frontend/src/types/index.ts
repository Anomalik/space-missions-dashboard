export interface Mission {
  Company: string;
  Location: string;
  Date: string;
  Time: string | null;
  Rocket: string;
  Mission: string;
  RocketStatus: string;
  Price: string | null;
  MissionStatus: string;
}

export interface SummaryStats {
  total_missions: number;
  success_rate: number;
  active_rockets: number;
  top_company: string;
  top_company_count: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ChartDataPoint {
  [key: string]: string | number;
}

export interface FilterState {
  company: string | null;
  statuses: string[];
  startDate: string | null;
  endDate: string | null;
  search: string;
}
