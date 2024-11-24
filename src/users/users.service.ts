import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from './users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HelpersService } from 'src/helpers/helpers.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HelpersModule } from 'src/helpers/helpers.module';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly helpersService: HelpersService,
  ) {}

  getExample(): boolean {
    return false;
  }

  async create(user: User): Promise<User> {
    const hashPassword = await this.helpersService.hashPasswordFunction(
      user.password,
    );
    console.log({ hashPassword });

    if (!user.firstname || !user.email || !user.password)
      throw new BadRequestException('Parameter is empty!.');

    const emailExist = await this.userRepository.findOneBy({
      email: user.email,
    });

    console.log({ emailExist });

    if (emailExist) throw new BadRequestException('Email already exist!.');

    // user.password = hashPassword
    const createUserData = await this.userRepository.save({
      ...user,
      password: hashPassword,
    });

    return createUserData;
  }

  async login({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<{ token: string; refreshToken: string }> {
    // Validate data
    if (!email || !password)
      throw new BadRequestException('Email or password must required!.');

    // Check email alreay in database
    const existEmail: User = await this.userRepository.findOneBy({ email });
    if (!existEmail)
      throw new BadRequestException('Email or password incorrect!.');

    // Compare password in database and input passord
    const pwMatch = this.helpersService.comparePassword(
      password,
      existEmail?.password,
    );
    if (!pwMatch)
      throw new BadRequestException('Email or password incorrect!.');

    // Gen toke
    const data = {
      id: existEmail.id,
      firstname: existEmail.firstname,
      lastname: existEmail.lastname,
    } as User;

    const token = this.helpersService.genToken(data);
    const refreshToken = this.helpersService.genRefreshToken(data);
    return { token, refreshToken };
  }

  async updateUserProfile(user: User, request: any): Promise<User> {
    // Validate data input
    if (!user.firstname || !user.lastname)
      throw new BadRequestException('Parameter is empty!.');

    // Clear email from user input
    if (user.email) delete user.email;

    // Hash password if user input
    if (user.password) {
      const hashPW: string = await this.helpersService.hashPasswordFunction(
        user.password,
      );
      user.password = hashPW;
    }

    // Check user already in database
    const userDataFromToken = request.user;

    const id: number = userDataFromToken.data.id;
    const existUser: User = await this.userRepository.findOneById(id);
    if (!existUser) throw new BadRequestException('Not found your data!.');

    await this.userRepository.update(id, user);
    const userData: User = await this.userRepository.findOneById(id);
    return userData;
  }

  async getOwnerProfile(request): Promise<User> {
    // Find user data from user table by id
    const userData: User = await this.userRepository.findOneBy({
      id: request.user.data.id,
    });

    // Clear password field
    delete userData.password;

    return userData;
  }

  async refreshToken(
    request: any,
  ): Promise<{ token: string; refreshToken: string }> {
    console.log({ request: request.headers['refresh-token'] });

    // Verfiy refresh token
    const userDataFromRefreshToken: any =
      this.helpersService.verifyRefreshToken(request.headers['refresh-token']);

    // Gen new token and refresh token
    const data = userDataFromRefreshToken.data;
    const newToken = this.helpersService.genToken(data);
    const newRefreshToken = this.helpersService.genRefreshToken(data);
    return { token: newToken, refreshToken: newRefreshToken };
  }
}
