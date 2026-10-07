import { PasswordRecoveryService } from './password-recovery.service';
import { PasswordRecoveryController } from './password-recovery.controller';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtTokenService } from './domain/jwt-token.service';

@Module({
  controllers: [AuthController, PasswordRecoveryController],
  providers: [AuthService, JwtTokenService, PasswordRecoveryService],
  exports: [AuthService, JwtTokenService],
})
export class AuthModule {}
