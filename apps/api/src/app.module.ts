import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PrismaService } from './common/database/prisma.service';
import { AuditService } from './common/audit/audit.service';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './modules/mail/mail.module';
import { requestId } from './common/middleware/request-id.middleware';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthModule } from './modules/health/health.module';
import { BillingModule } from './modules/billing/billing.module';
@Module({imports:[ConfigModule.forRoot({isGlobal:true}),MailModule,AuthModule,UsersModule,OrganizationsModule,ProjectsModule,AdminModule,HealthModule,BillingModule],providers:[PrismaService,AuditService],exports:[PrismaService,AuditService]})
export class AppModule implements NestModule { configure(c:MiddlewareConsumer){c.apply(requestId).forRoutes('*');} }