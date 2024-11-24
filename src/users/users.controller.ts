import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './users.entity';
import { AuthGuard } from 'src/helpers/auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}
  @Get()
  example(): boolean {
    return this.userService.getExample();
  }

  @Post('create')
  create(@Body() user: User): Promise<User> {
    return this.userService.create(user);
  }

  @Post('login')
  login(
    @Body() { email, password }: { email: string; password: string },
  ): Promise<{ token: string; refreshToken: string }> {
    return this.userService.login({ email, password });
  }

  @Put('update/profile')
  @UseGuards(AuthGuard)
  updateProfile(@Req() request: any, @Body() user: User): Promise<User> {
    return this.userService.updateUserProfile(user, request);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  ownerProfile(@Req() request: any): Promise<User> {
    return this.userService.getOwnerProfile(request);
  }

  @Put('refresh/token')
  refreshToken(
    @Req() request: any,
  ): Promise<{ token: string; refreshToken: string }> {
    return this.userService.refreshToken(request);
  }
}

// http://localhost:4000/api/v1/users/update/profile
