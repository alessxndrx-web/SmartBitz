import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesModule } from '../roles/roles.module';

const jwtSecret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev-jwt-secret');

if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required in production');
}

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: jwtSecret,
      signOptions: { expiresIn: '24h' },
    }),
    forwardRef(() => RolesModule),
  ],
  controllers: [AuthController],
  providers: [AuthService,  JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
