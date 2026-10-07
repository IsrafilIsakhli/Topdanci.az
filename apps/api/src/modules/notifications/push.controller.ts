import { Body, Controller, Get, Post, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsIn, Matches } from 'class-validator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../common/auth/authenticated-user';
import { PrismaService } from '../prisma/prisma.service';
export class PushTokenDto { @Matches(/^(ExponentPushToken|ExpoPushToken)\[[A-Za-z0-9_-]{8,200}\]$/) token!:string; }
export class RegisterPushDto extends PushTokenDto { @IsIn(['ios','android']) platform!:string; }
@Controller({path:'notifications/push',version:'1'})
export class PushController {
  constructor(private readonly prisma:PrismaService,private readonly config:ConfigService){}
  @Get('status') async status(@CurrentUser() user:AuthenticatedUser){
    return {data:{configured:this.config.get('PUSH_ENABLED')==='true',devices:await this.prisma.pushDevice.count({where:{userId:user.id}})}};
  }
  @Post('register') async register(@CurrentUser() user:AuthenticatedUser,@Body() dto:RegisterPushDto){
    if (this.config.get('PUSH_ENABLED')!=='true') throw new ServiceUnavailableException('Push bildiriş xidməti hələ qoşulmayıb.');
    await this.prisma.$transaction(async(tx)=>{
      const device=await tx.pushDevice.upsert({where:{token:dto.token},create:{...dto,userId:user.id},update:{userId:user.id,platform:dto.platform},select:{id:true}});
      await tx.pushDelivery.deleteMany({where:{deviceId:device.id,userId:{not:user.id}}});
    });
    return {data:{registered:true}};
  }
  @Post('unregister') async unregister(@CurrentUser() user:AuthenticatedUser,@Body() dto:PushTokenDto){
    await this.prisma.pushDevice.deleteMany({where:{userId:user.id,token:dto.token}});
    return {data:{registered:false}};
  }
}