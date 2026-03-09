import { SetMetadata } from '@nestjs/common';

export const AUDIT_KEY = 'audit';
export const Audit = (action: string, module: string) =>
  SetMetadata(AUDIT_KEY, { action, module });
