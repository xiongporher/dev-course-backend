import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/users.entity';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

@Injectable()
export class HelpersService {
  private jwtScretKey: string;
  private jwtRefresTokenSecretKey: string;
  constructor(configService: ConfigService) {
    this.jwtScretKey = configService.get<string>('JWT_SECRET_KEY');
    this.jwtRefresTokenSecretKey = configService.get<string>(
      'REFRESH_JWT_SECRET_KEY',
    );
  }

  async hashPasswordFunction(passord: string): Promise<string> {
    const saltRounds = 10;

    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(passord, salt);

    return hash;
  }

  comparePassword(passord: string, hashPassword: string): boolean {
    const match = bcrypt.compareSync(passord, hashPassword); // true
    return match;
  }

  genToken(data: User): string {
    const token = jwt.sign(
      {
        data: data,
      },
      this.jwtScretKey,
      { expiresIn: '1h' },
    );

    return token;
  }

  genRefreshToken(data: User): string {
    const token = jwt.sign(
      {
        data: data,
      },
      this.jwtRefresTokenSecretKey,
      { expiresIn: '30d' },
    );

    return token;
  }

  verifyAccessToken(token: string): User {
    try {
      const decoded = jwt.verify(token, this.jwtScretKey);

      // decoded = {
      // data: {id: 1, firstname: "2kkkk", lastname: 'asdfas'}
      // }
      return decoded;
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }
  
  verifyRefreshToken(token: string): User {
    try {
      const decoded = jwt.verify(token, this.jwtRefresTokenSecretKey);

      return decoded;
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }
}
