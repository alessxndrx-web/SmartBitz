import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from './audit.service';
import { Request } from 'express';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private auditService: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'];

    // Obtener tenantId y userId del contexto de auth (JWT) y, como último recurso, de otras fuentes controladas
    const user = request['user'] as any;
    const requestTenantId =
      (user && (user.tenantId || user.tenant_id)) ||
      (request['tenantId'] as string) ||
      (request.headers['x-tenant-id'] as string);
    const requestUserId =
      (user && (user.userId || user.id)) ||
      (request['userId'] as string);

    // Determinar módulo y acción basado en la ruta
    const [module] = url.split('/').filter(Boolean);
    const action = this.getActionFromMethod(method);

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (response) => {
          const duration = Date.now() - startTime;

          const responseTenantId =
            response?.tenant?.id ||
            response?.user?.tenantId ||
            response?.data?.tenant?.id ||
            response?.data?.user?.tenantId;
          const tenantId = requestTenantId || responseTenantId;
          const userId =
            requestUserId ||
            response?.user?.id ||
            response?.data?.user?.id;

          // Fail-safe: if we cannot determine tenantId, don't attempt persistence
          if (!tenantId) {
            return;
          }
          
          // Log de acción exitosa
          this.auditService.logAction(
            module || 'unknown',
            `${action}_${this.getEndpointFromUrl(url)}`,
            tenantId,
            userId,
            this.getEntityIdFromResponse(response),
            this.getEntityTypeFromUrl(url),
            null, // oldValues - se podría implementar si se necesita
            response, // newValues
            ip,
            userAgent,
            `Success - ${duration}ms`,
          );
        },
        error: (error) => {
          const duration = Date.now() - startTime;

          const tenantId = requestTenantId;
          const userId = requestUserId;

          // Fail-safe: avoid breaking requests on audit persistence when tenantId is unknown
          if (!tenantId) {
            return;
          }
          
          // Log de error
          this.auditService.logAction(
            module || 'unknown',
            `${action}_${this.getEndpointFromUrl(url)}_error`,
            tenantId,
            userId,
            null,
            this.getEntityTypeFromUrl(url),
            null,
            { error: error.message, stack: error.stack },
            ip,
            userAgent,
            `Error - ${duration}ms - ${error.message}`,
          );
        },
      }),
    );
  }

  private getActionFromMethod(method: string): string {
    switch (method) {
      case 'GET':
        return 'read';
      case 'POST':
        return 'create';
      case 'PATCH':
      case 'PUT':
        return 'update';
      case 'DELETE':
        return 'delete';
      default:
        return 'unknown';
    }
  }

  private getEndpointFromUrl(url: string): string {
    const parts = url.split('/').filter(Boolean);
    if (parts.length >= 2) {
      return parts[1];
    }
    return 'endpoint';
  }

  private getEntityIdFromResponse(response: any): string | undefined {
    // Intentar extraer ID de la respuesta
    if (response?.id) {
      return response.id;
    }
    if (response?.data?.id) {
      return response.data.id;
    }
    return undefined;
  }

  private getEntityTypeFromUrl(url: string): string {
    const parts = url.split('/').filter(Boolean);
    if (parts.length >= 1) {
      // Convertir plural a singular (ej: "purchases" -> "purchase")
      return parts[0].slice(0, -1);
    }
    return 'entity';
  }
}
