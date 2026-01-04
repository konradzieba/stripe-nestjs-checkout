import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StripeModule } from './stripe/stripe.module';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { envSchema } from './config/env.schema';
import z from 'zod';
import { stripeConfig } from './config/stripe.config';
import { databaseConfig } from './config/database.config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    StripeModule,
    ConfigModule.forRoot({
      load: [stripeConfig, databaseConfig],
      isGlobal: true,
      validate: (config) => {
        const parsed = envSchema.safeParse(config);

        if (!parsed.success) {
          const formatted = z.treeifyError(parsed.error);
          throw new Error(
            `Invalid environment variables: ${JSON.stringify(formatted, null, 2)}`,
          );
        }
        return parsed.data;
      },
    }),
    TypeOrmModule.forRootAsync({
      inject: [databaseConfig.KEY],
      useFactory: (db: ConfigType<typeof databaseConfig>) => {
        // DATABASE_URL variant
        if (db.url) {
          return {
            type: 'postgres' as const,
            url: db.url,
            autoLoadEntities: true,
            synchronize: db.sync,
            migrationsRun: !db.sync,
            migrations: ['dist/migrations/*.js'],
          };
        }

        // DB parameters variant
        return {
          type: 'postgres' as const,
          host: db.host,
          port: db.port,
          username: db.user,
          password: db.password,
          database: db.name,
          autoLoadEntities: true,
          synchronize: db.sync,
          migrationsRun: !db.sync,
          migrations: ['dist/migrations/*.js'],
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule {}
