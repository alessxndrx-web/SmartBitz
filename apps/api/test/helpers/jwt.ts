import { JwtService } from '@nestjs/jwt';

const jwtService = new JwtService({ secret: 'dev-jwt-secret' });

export function signTestJwt(payload: {
  userId: string;
  email: string;
  role: string;
  tenantId?: string;
  membershipId?: string;
}) {
  return jwtService.sign({
    sub: payload.userId,
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    tenantId: payload.tenantId,
    membershipId: payload.membershipId,
  });
}
