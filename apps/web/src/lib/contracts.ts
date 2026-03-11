export type PaginatedResponse<T, K extends string> = {
  [P in K]: T[];
} & {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export interface PaymentsStatsResponse {
  totalPayments: number;
  totalCollected: number;
}

export interface PlatformAdminOverviewResponse {
  generatedAt: string;
  totals: {
    tenants: number;
    activeTenants: number;
    users: number;
    activeUsers: number;
    invoices: {
      total: number;
      paid: number;
      pending: number;
    };
    supportTickets: {
      open: number;
      inProgress: number;
      totalActive: number;
    };
  };
  subscriptions: Array<{
    plan: string;
    count: number;
  }>;
}


export interface HealthResponse {
  status: string;
  statusCode: number;
  timestamp: string;
  [key: string]: unknown;
}
