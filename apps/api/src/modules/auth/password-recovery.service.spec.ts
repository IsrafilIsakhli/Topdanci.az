import { describe, expect, it, vi, afterEach } from 'vitest';
import type { ConfigService } from '@nestjs/config';
import type { PrismaService } from '../prisma/prisma.service';
import { PasswordRecoveryService, resetCodeHash } from './password-recovery.service';
const secret='test-secret';
const config={get:(key:string)=>key==='RESEND_API_KEY'?'key':key==='MAIL_FROM'?'test@sample.az':undefined,getOrThrow:()=>secret} as unknown as ConfigService;
afterEach(()=>vi.unstubAllGlobals());
describe('Şifrə bərpası',()=>{
 it('xidmət ayarı yoxdursa məktub göndərildiyini iddia etmir',async()=>{const s=new PasswordRecoveryService({} as PrismaService,{get:()=>undefined} as unknown as ConfigService);await expect(s.forgot({email:'a@b.az'})).rejects.toThrow('hələ qoşulmayıb');});
 it('tanınmayan hesab üçün neytral cavab qaytarır',async()=>{const fetch=vi.fn();vi.stubGlobal('fetch',fetch);const s=new PasswordRecoveryService({user:{findFirst:async()=>null}} as unknown as PrismaService,config);expect((await s.forgot({email:'a@b.az'})).data.message).toContain('varsa');expect(fetch).not.toHaveBeenCalled();});
 it('uğursuz kod cəhdini saxlayır',async()=>{
 const update=vi.fn(),tx={$queryRaw:vi.fn(),user:{findFirst:async()=>({id:'u'})},passwordResetChallenge:{findFirst:async()=>({id:'c',codeHash:resetCodeHash(secret,'u','123456'),expiresAt:new Date(Date.now()+10000),attempts:0}),update}};
 const s=new PasswordRecoveryService({user:{findFirst:async()=>({id:'u'})},$transaction:async(fn:(t:typeof tx)=>unknown)=>fn(tx)} as unknown as PrismaService,config);
 await expect(s.reset({email:'a@b.az',code:'999999',password:'NewPassword9'})).rejects.toThrow('Kod səhvdir');expect(update).toHaveBeenCalledWith({where:{id:'c'},data:{attempts:{increment:1}}});
 });
 it('limitə çatmış və vaxtı keçmiş kodu qəbul etmir',async()=>{
 for(const condition of [{expiresAt:new Date(0),attempts:0},{expiresAt:new Date(Date.now()+10000),attempts:5}]){
 const update=vi.fn(),tx={$queryRaw:vi.fn(),user:{findFirst:async()=>({id:'u'}),update},passwordResetChallenge:{findFirst:async()=>({id:'c',codeHash:resetCodeHash(secret,'u','123456'),...condition})}};
 const s=new PasswordRecoveryService({user:{findFirst:async()=>({id:'u'})},$transaction:async(fn:(t:typeof tx)=>unknown)=>fn(tx)} as unknown as PrismaService,config);
 await expect(s.reset({email:'a@b.az',code:'123456',password:'NewPassword9'})).rejects.toThrow();expect(update).not.toHaveBeenCalled();
 }});
 it('kodu yalnız bir dəfə işlədib sessiyaları və push qeydiyyatını bağlayır',async()=>{
 let used=false;const revoke=vi.fn(),remove=vi.fn(),password=vi.fn();
 const tx={$queryRaw:vi.fn(),user:{findFirst:async()=>({id:'u'}),update:password},passwordResetChallenge:{findFirst:async()=>used?null:{id:'c',codeHash:resetCodeHash(secret,'u','123456'),expiresAt:new Date(Date.now()+10000),attempts:0},updateMany:async()=>{used=true;}},refreshSession:{updateMany:revoke},pushDevice:{deleteMany:remove}};
 const s=new PasswordRecoveryService({user:{findFirst:async()=>({id:'u'})},$transaction:async(fn:(t:typeof tx)=>unknown)=>fn(tx)} as unknown as PrismaService,config);
 await s.reset({email:'a@b.az',code:'123456',password:'NewPassword9'});
 await expect(s.reset({email:'a@b.az',code:'123456',password:'NewPassword9'})).rejects.toThrow();
 expect(password).toHaveBeenCalledOnce();expect(revoke).toHaveBeenCalledOnce();expect(remove).toHaveBeenCalledOnce();
 });
})