import{CanActivate,ExecutionContext,Injectable,TooManyRequestsException}from'@nestjs/common';
import Redis from'ioredis';
@Injectable() export class RateLimitGuard implements CanActivate{
 private redis?:Redis;private memory=new Map<string,{count:number;reset:number}>();
 constructor(){if(process.env.REDIS_URL){this.redis=new Redis(process.env.REDIS_URL,{lazyConnect:true,maxRetriesPerRequest:1});this.redis.connect().catch(()=>undefined)}}
 async canActivate(ctx:ExecutionContext){const req=ctx.switchToHttp().getRequest();const key='rl:'+req.ip+':'+req.path;const limit=20;const window=60;if(this.redis){try{const n=await this.redis.incr(key);if(n===1)await this.redis.expire(key,window);if(n>limit)throw new TooManyRequestsException('Too many requests');return true}catch(e){if(e instanceof TooManyRequestsException)throw e}}
 const now=Date.now();const item=this.memory.get(key);if(!item||item.reset<now){this.memory.set(key,{count:1,reset:now+window*1000});return true}item.count++;if(item.count>limit)throw new TooManyRequestsException('Too many requests');return true}}
