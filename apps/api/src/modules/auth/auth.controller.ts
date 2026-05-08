import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  @Get('session')
  session() {
    return {
      data: {
        authenticated: false,
      },
    };
  }
}
