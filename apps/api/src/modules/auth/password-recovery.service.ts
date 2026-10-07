import { createHmac, randomInt, timingSafeEqual } from 'node:crypto';
import { BadRequestException, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { isStrongPassword } from './domain/password-policy';
import type { ForgotPasswordDto, ResetPasswordDto } from './password-recovery.dto';
const neutral = { data: { message: 'Bu e-poçtla aktiv hesab varsa, bərpa kodu göndəriləcək. Kod 15 dəqiqə etibarlıdır.' } };
export function resetCodeHash(secret:string,userId:string,code:string) { return createHmac('sha256',secret).update('password-reset:'+userId+':'+code).digest('hex'); }
export function sameResetHash(a:string,b:string) { const x=Buffer.from(a,'hex'),y=Buffer.from(b,'hex'); return x.length===y.length && timingSafeEqual(x,y); }
@Injectable()
export class PasswordRecoveryService {
  private readonly logger = new Logger(PasswordRecoveryService.name);
  constructor(private readonly prisma:PrismaService,private readonly config:ConfigService) {}
  async forgot(dto:ForgotPasswordDto) {
    const key=this.config.get<string>('RESEND_API_KEY'),from=this.config.get<string>('MAIL_FROM');
    if (!key || !from) throw new ServiceUnavailableException('Şifrə bərpa xidməti hələ qoşulmayıb. Dəstək bölməsinə müraciət edin.');
    const user=await this.prisma.user.findFirst({where:{email:dto.email,status:'ACTIVE'},select:{id:true}});
    if (!user) return neutral;
    const code=String(randomInt(100000,1000000));
    const challenge=await this.prisma.$transaction(async(tx)=>{
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${user.id} FOR UPDATE`;
      const latest=await tx.passwordResetChallenge.findFirst({where:{userId:user.id},orderBy:{createdAt:'desc'},select:{createdAt:true}});
      if (latest && Date.now()-latest.createdAt.getTime()<60000) return null;
      await tx.passwordResetChallenge.updateMany({where:{userId:user.id,usedAt:null},data:{usedAt:new Date()}});
      return tx.passwordResetChallenge.create({data:{userId:user.id,codeHash:resetCodeHash(this.config.getOrThrow('JWT_REFRESH_SECRET'),user.id,code),expiresAt:new Date(Date.now()+900000)},select:{id:true}});
    });
    if (!challenge) return neutral;
    try {
      const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{authorization:'Bearer '+key,'content-type':'application/json','Idempotency-Key':'reset-'+challenge.id},
        body:JSON.stringify({from,to:[dto.email],subject:'TopdanBazar — şifrə bərpa kodu',text:'Bərpa kodunuz: '+code+'\nKod 15 dəqiqə etibarlıdır. Bu sorğunu siz etməmisinizsə, məktubu nəzərə almayın.'}),signal:AbortSignal.timeout(10000)});
      if (!response.ok) throw new Error('mail_delivery_failed');
    } catch {
      await this.prisma.passwordResetChallenge.updateMany({where:{id:challenge.id},data:{usedAt:new Date()}});
      this.logger.error('password_reset_delivery_failed');
      // Cavab hesabın mövcudluğunu açıqlamır; çatdırılma xətası server jurnalındadır.
    }
    return neutral;
  }
  async reset(dto:ResetPasswordDto) {
    if (!isStrongPassword(dto.password)) throw new BadRequestException('Şifrə ən az 8 simvol, böyük və kiçik hərf və rəqəm içərməlidir.');
    const user=await this.prisma.user.findFirst({where:{email:dto.email,status:'ACTIVE'},select:{id:true}});
    if (!user) throw new BadRequestException('Kod səhvdir və ya müddəti bitib.');
    const passwordHash=await bcrypt.hash(dto.password,12);
    const accepted=await this.prisma.$transaction(async(tx)=>{
      await tx.$queryRaw`SELECT id FROM users WHERE id = ${user.id} FOR UPDATE`;
      const active=await tx.user.findFirst({where:{id:user.id,status:'ACTIVE'},select:{id:true}});
      const challenge=await tx.passwordResetChallenge.findFirst({where:{userId:user.id,usedAt:null},orderBy:[{createdAt:'desc'},{id:'desc'}]});
      if (!active || !challenge || challenge.expiresAt<=new Date() || challenge.attempts>=5) return false;
      if (!sameResetHash(challenge.codeHash,resetCodeHash(this.config.getOrThrow('JWT_REFRESH_SECRET'),user.id,dto.code))) {
        await tx.passwordResetChallenge.update({where:{id:challenge.id},data:{attempts:{increment:1}}}); return false;
      }
      await tx.passwordResetChallenge.updateMany({where:{userId:user.id,usedAt:null},data:{usedAt:new Date()}});
      await tx.user.update({where:{id:user.id},data:{passwordHash}});
      await tx.refreshSession.updateMany({where:{userId:user.id,revokedAt:null},data:{revokedAt:new Date()}});
      await tx.pushDevice.deleteMany({where:{userId:user.id}});
      return true;
    });
    if (!accepted) throw new BadRequestException('Kod səhvdir və ya müddəti bitib. Yeni kod istəyin.');
    return {data:{message:'Şifrəniz yeniləndi. Yeni şifrə ilə daxil olun.'}};
  }
}