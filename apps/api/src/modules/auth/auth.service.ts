import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../common/database/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { MailService } from '../mail/mail.service';
import * as argon2 from 'argon2';
import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { Response } from 'express';
const digest=(value:string)=>createHash('sha256').update(value).digest('hex');
@Injectable()
export class AuthService {
 constructor(private db:PrismaService,private jwt:JwtService,private audit:AuditService,private mail:MailService){}
 private setCookies(res:Response,access:string,refresh:string){const base={httpOnly:true,secure:process.env.COOKIE_SECURE==='true',sameSite:'lax' as const,path:'/',domain:process.env.COOKIE_DOMAIN||undefined};res.cookie('access_token',access,{...base,maxAge:900000});res.cookie('refresh_token',refresh,{...base,maxAge:604800000});}
 private async issue(userId:string,res:Response,familyId=randomUUID()){const access=await this.jwt.signAsync({sub:userId},{secret:process.env.JWT_ACCESS_SECRET,expiresIn:'15m'});const refresh=randomBytes(48).toString('base64url');await this.db.refreshSession.create({data:{userId,familyId,tokenHash:digest(refresh),expiresAt:new Date(Date.now()+604800000)}});this.setCookies(res,access,refresh);}
 private publicUser(user:{id:string;email:string;name:string;role:'USER'|'ADMIN';avatarUrl:string|null;emailVerifiedAt:Date|null;isActive:boolean}){return{id:user.id,email:user.email,name:user.name,role:user.role,avatarUrl:user.avatarUrl,emailVerified:Boolean(user.emailVerifiedAt),isActive:user.isActive};}
 async register(email:string,name:string,password:string,res:Response){const normalized=email.trim().toLowerCase();if(await this.db.user.findUnique({where:{email:normalized}}))throw new BadRequestException('Email is already registered');const user=await this.db.user.create({data:{email:normalized,name:name.trim(),passwordHash:await argon2.hash(password)}});const token=randomBytes(32).toString('base64url');await this.db.emailToken.create({data:{userId:user.id,tokenHash:digest(token),type:'VERIFY_EMAIL',expiresAt:new Date(Date.now()+86400000)}});await this.mail.send({to:user.email,subject:'Verify your email',text:token});await this.issue(user.id,res);await this.audit.record({actorId:user.id,action:'REGISTER',entity:'User',entityId:user.id});return this.publicUser(user);}
 async login(email:string,password:string,res:Response){const user=await this.db.user.findUnique({where:{email:email.trim().toLowerCase()}});if(!user||!user.isActive||!(await argon2.verify(user.passwordHash,password)))throw new UnauthorizedException('Invalid email or password');await this.issue(user.id,res);await this.audit.record({actorId:user.id,action:'LOGIN',entity:'User',entityId:user.id});return this.publicUser(user);}
 async refresh(token:string|undefined,res:Response){if(!token)throw new UnauthorizedException('Refresh token required');const session=await this.db.refreshSession.findUnique({where:{tokenHash:digest(token)},include:{user:true}});if(!session)throw new UnauthorizedException('Invalid refresh token');if(session.revokedAt||session.expiresAt<=new Date()){await this.db.refreshSession.updateMany({where:{familyId:session.familyId},data:{revokedAt:new Date()}});throw new UnauthorizedException('Refresh token reuse detected');}const next=randomBytes(48).toString('base64url');const rotated = await this.db.$transaction(async (tx) => {
      const claimed = await tx.refreshSession.updateMany({
        where: { id: session.id, revokedAt: null },
        data: { revokedAt: new Date(), replacedBy: digest(next) },
      });
      if (claimed.count !== 1) return false;
      await tx.refreshSession.create({
        data: {
          userId: session.userId,
          familyId: session.familyId,
          tokenHash: digest(next),
          expiresAt: new Date(Date.now() + 604800000),
        },
      });
      return true;
    });
    if (!rotated) {
      await this.db.refreshSession.updateMany({
        where: { familyId: session.familyId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Refresh token reuse detected');
    }const access=await this.jwt.signAsync({sub:session.userId},{secret:process.env.JWT_ACCESS_SECRET,expiresIn:'15m'});this.setCookies(res,access,next);return this.publicUser(session.user);}
 async logout(token:string|undefined,res:Response){if(token){const session=await this.db.refreshSession.findUnique({where:{tokenHash:digest(token)}});if(session)await this.db.refreshSession.updateMany({where:{familyId:session.familyId},data:{revokedAt:new Date()}});}res.clearCookie('access_token');res.clearCookie('refresh_token');return{success:true};}
 async me(id:string){const user=await this.db.user.findUnique({where:{id}});if(!user)throw new UnauthorizedException();return this.publicUser(user);}
 async verifyEmail(token:string){const record=await this.db.emailToken.findFirst({where:{tokenHash:digest(token),type:'VERIFY_EMAIL',usedAt:null}});if(!record||record.expiresAt<=new Date())throw new BadRequestException('Invalid or expired token');await this.db.$transaction([this.db.emailToken.update({where:{id:record.id},data:{usedAt:new Date()}}),this.db.user.update({where:{id:record.userId},data:{emailVerifiedAt:new Date()}})]);return{success:true};}
 async forgot(email:string){const user=await this.db.user.findUnique({where:{email:email.trim().toLowerCase()}});if(user){const token=randomBytes(32).toString('base64url');await this.db.passwordResetToken.create({data:{userId:user.id,tokenHash:digest(token),expiresAt:new Date(Date.now()+3600000)}});await this.mail.send({to:user.email,subject:'Reset your password',text:token});}return{success:true};}
 async reset(token:string,password:string){const record=await this.db.passwordResetToken.findFirst({where:{tokenHash:digest(token),usedAt:null}});if(!record||record.expiresAt<=new Date())throw new BadRequestException('Invalid or expired token');await this.db.$transaction([this.db.passwordResetToken.update({where:{id:record.id},data:{usedAt:new Date()}}),this.db.user.update({where:{id:record.userId},data:{passwordHash:await argon2.hash(password)}}),this.db.refreshSession.updateMany({where:{userId:record.userId},data:{revokedAt:new Date()}})]);await this.audit.record({actorId:record.userId,action:'PASSWORD_RESET',entity:'User',entityId:record.userId});return{success:true};}
}