import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../common/decorators/public.decorator';
import { ForgotPasswordDto, ResetPasswordDto } from './password-recovery.dto';
import { PasswordRecoveryService } from './password-recovery.service';
@Controller({path:'auth',version:'1'})
export class PasswordRecoveryController {
  constructor(private readonly service:PasswordRecoveryService){}
  @Public() @Post('forgot-password') @HttpCode(200) @Throttle({default:{limit:5,ttl:3600000}})
  forgot(@Body() dto:ForgotPasswordDto){return this.service.forgot(dto);}
  @Public() @Post('reset-password') @HttpCode(200) @Throttle({default:{limit:10,ttl:60000}})
  reset(@Body() dto:ResetPasswordDto){return this.service.reset(dto);}
}