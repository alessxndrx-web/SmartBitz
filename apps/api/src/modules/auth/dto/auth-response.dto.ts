export class AuthResponseDto {
  user: {
    id: string;
    fullName: string;
    email: string;
    role: string;
    tenantId: string;
    permissions?: string[];
  };
  accessToken: string;
  tenant: {
    id: string;
    name: string;
    slug: string;
    businessType: string;
  };
}
