import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StripeModule } from './stripe/stripe.module';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './config/env.schema';
import z from 'zod';
import { stripeConfig } from './config/stripe.config';
import { databaseConfig } from './config/database.config';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
