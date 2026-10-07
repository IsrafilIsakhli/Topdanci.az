import { Injectable, Logger, type OnModuleInit, type OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
type Ticket={status?:string;id?:string;details?:{error?:string}};
@Injectable()
export class PushService implements OnModuleInit, OnModuleDestroy {
  private timer?:ReturnType<typeof setInterval>; private busy=false; private logger=new Logger(PushService.name);
  constructor(private readonly prisma:PrismaService,private readonly config:ConfigService){}
  onModuleInit(){if(this.config.get('PUSH_ENABLED')==='true'){this.timer=setInterval(()=>void this.flush(),15000);this.timer.unref();}}
  onModuleDestroy(){if(this.timer)clearInterval(this.timer);}
  async enqueue(userIds:string[],input:{id:string;title:string;message:string;href?:string|null}){
    if(this.config.get('PUSH_ENABLED')!=='true')return;
    const devices=await this.prisma.pushDevice.findMany({where:{userId:{in:userIds},user:{status:'ACTIVE'}}});
    if(devices.length)await this.prisma.pushDelivery.createMany({data:devices.map(d=>({deviceId:d.id,userId:d.userId,notificationId:input.id,title:input.title,message:input.message,href:input.href ?? null}))});
  }
  private async request(path:string,body:unknown){
    const key=this.config.get<string>('EXPO_ACCESS_TOKEN');
    const response=await fetch('https://exp.host/--/api/v2/push/'+path,{method:'POST',headers:{'content-type':'application/json',...(key?{authorization:'Bearer '+key}:{})},body:JSON.stringify(body),signal:AbortSignal.timeout(10000)});
    if(!response.ok)throw new Error('push_provider_failed');
    return response.json() as Promise<{data?:Ticket[]|Record<string,Ticket>}>;
  }
  async flush(){
    if(this.busy)return;this.busy=true;
    try{
      const now=new Date();
      const jobs=await this.prisma.pushDelivery.findMany({where:{status:{in:['PENDING','RECEIPT']},nextAttemptAt:{lte:now}},take:50,orderBy:{nextAttemptAt:'asc'},include:{device:{include:{user:{select:{status:true}}}}}});
      for(const job of jobs){
        const claimed=await this.prisma.pushDelivery.updateMany({where:{id:job.id,nextAttemptAt:{lte:now},status:job.status},data:{nextAttemptAt:new Date(Date.now()+120000),attempts:{increment:1}}});
        if(!claimed.count)continue;
        if(job.device.userId!==job.userId || job.device.user.status!=='ACTIVE' || Date.now()-job.createdAt.getTime()>86400000){await this.prisma.pushDelivery.update({where:{id:job.id},data:{status:'CANCELLED'}});continue;}
        try{
          const current=await this.prisma.pushDevice.findFirst({where:{id:job.deviceId,userId:job.userId,user:{status:'ACTIVE'}},select:{id:true}});
          if(!current){await this.prisma.pushDelivery.updateMany({where:{id:job.id},data:{status:'CANCELLED'}});continue;}
          let result:Ticket|undefined;
          if(job.status==='RECEIPT' && job.receiptId){
            const response=await this.request('getReceipts',{ids:[job.receiptId]});result=(response.data as Record<string,Ticket>|undefined)?.[job.receiptId];
            if(!result)throw new Error('receipt_pending');
          }else{
            const response=await this.request('send',{to:job.device.token,title:'TopdanBazar',body:'Hesabınızda yeni bildiriş var. Açaraq ətraflı baxın.',sound:'default',channelId:'updates',data:{href:job.href,notificationId:job.notificationId,userId:job.userId},ttl:3600});
            result=Array.isArray(response.data)?response.data[0]:response.data as Ticket|undefined;
          }
          if(result?.details?.error==='DeviceNotRegistered'){await this.prisma.pushDevice.deleteMany({where:{id:job.deviceId}});continue;}
          if(result?.status!=='ok'||(job.status==='PENDING'&&!result.id))throw new Error('push_rejected');
          await this.prisma.pushDelivery.update({where:{id:job.id},data:job.status==='RECEIPT'?{status:'DELIVERED'}:{status:'RECEIPT',receiptId:result.id ?? null,nextAttemptAt:new Date(Date.now()+900000),attempts:0}});
        }catch{
          await this.prisma.pushDelivery.updateMany({where:{id:job.id},data:{status:job.attempts>=4?'FAILED':job.status,nextAttemptAt:new Date(Date.now()+Math.min(3600000,60000*2**job.attempts))}});
          this.logger.warn('push_delivery_retry_or_failed');
        }
      }
      await this.prisma.pushDelivery.deleteMany({where:{createdAt:{lt:new Date(Date.now()-7*86400000)}}});
    }catch{this.logger.warn('push_worker_unavailable');}finally{this.busy=false;}
  }
}