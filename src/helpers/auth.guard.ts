import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { HelpersService } from './helpers.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly helpersService: HelpersService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // const token = request.headers.authorization.split(' ')[1]
    const token: string = request.headers.authorization.replace('Bearer ', '');
    if (!token) throw new BadRequestException('Token must required!.');

    // Method1
    // Bearer asdljkflm;erfiupadkos;l';fmasfsalf
    // request.headers.authorization.split(' ') =>
    // ["Bearer", "asdljkflm;erfiupadkos;l';fmasfsalf"]

    // Method 2
    // Bearer asdljkflm;erfiupadkos;l';fmasfsalf
    // request.headers.authorization.replace('Bearer ', '') => asdljkflm;erfiupadkos;l';fmasfsalf

    const userData = this.helpersService.verifyAccessToken(token);

    request.user = userData;

    // request = {
    // user: {
    // data: {id: 1, firstname: "2kkkk", lastname: 'asdfas'}
    // }
    // }
    return true;
  }
}
