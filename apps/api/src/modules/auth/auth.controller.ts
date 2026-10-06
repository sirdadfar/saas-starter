import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { Public } from '../../common/auth/public.decorator';
import { RateLimitGuard } from '../../common/rate-limit/rate-limit.guard';
import { UseGuards } from '@nestjs/common';
class RegisterDto { @IsEmail() email!:string; @IsString() @MinLength(2) name!:string; @IsString() @MinLength(10) password!:string; }
class LoginDto { @IsEmail() email!:string; @IsString() @MinLength(1) password!:string; }
class TokenDto { @IsString() token!:string; }
class ResetDto { @IsString() token!:string; @IsString() @MinLength(10) password!:string; }
@ApiTags('auth') @Controller('auth')
export class AuthController {
 constructor(private service:AuthService){}
 @Public() @UseGuards(RateLimitGuard) @Post('register') register(@Body() b:RegisterDto,@Res({passthrough:true}) r:Response){return this.service.register(b.email,b.name,b.password,r);}
 @Public() @UseGuards(RateLimitGuard) @Post('login') login(@Body() b:LoginDto,@Res({passthrough:true}) r:Response){return this.service.login(b.email,b.password,r);}
 @Public() @Post('refresh') refresh(@Req() q:Request,@Res({passthrough:true}) r:Response){return this.service.refresh(q.cookies?.refresh_token,r);}
 @Post('logout') logout(@Req() q:Request,@Res({passthrough:true}) r:Response){return this.service.logout(q.cookies?.refresh_token,r);}
 @Get('me') me(@Req() q:Request){return this.service.me((q as Request&{user:{id:string}}).user.id);}
 @Public() @Post('verify-email') verify(@Body() b:TokenDto){return this.service.verifyEmail(b.token);}
 @Public() @UseGuards(RateLimitGuard) @Post('forgot-password') forgot(@Body() b:{email:string}){return this.service.forgot(b.email);}
 @Public() @Post('reset-password') reset(@Body() b:ResetDto){return this.service.reset(b.token,b.password);}
}