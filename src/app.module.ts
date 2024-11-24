import { Module } from '@nestjs/common';  
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module'; 
import { HelpersModule } from './helpers/helpers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    DatabaseModule,
    UsersModule,
    HelpersModule
  ], 
})
export class AppModule {}
