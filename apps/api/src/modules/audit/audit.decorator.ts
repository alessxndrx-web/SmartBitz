import { SetMetadata } from '@nestjs/common';

export const AUDIT_KEY = 'audit';

export interface AuditOptions {
  module: string;
  action: string;
  entityType?: string;
  sensitive?: boolean; // No loggear valores sensibles
}

export const Audit = (options: AuditOptions) => SetMetadata(AUDIT_KEY, options);
