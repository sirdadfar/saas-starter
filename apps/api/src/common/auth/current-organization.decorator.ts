import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export const CurrentOrganization=createParamDecorator((_data:unknown,ctx:ExecutionContext)=>ctx.switchToHttp().getRequest().organization);
