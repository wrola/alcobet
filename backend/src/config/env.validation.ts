import { IsString, IsOptional, IsEmail, IsUrl } from 'class-validator';
import { plainToInstance, Transform } from 'class-transformer';
import { validateSync } from 'class-validator';

export class EnvironmentVariables {
  @IsString()
  NODE_ENV: string = 'development';

  @IsString()
  @IsOptional()
  DATABASE_URL?: string = './database.sqlite';

  @IsString()
  GOOGLE_CLIENT_ID: string;

  @IsString()
  GOOGLE_CLIENT_SECRET: string;

  @IsString()
  SESSION_SECRET: string;

  @IsEmail()
  GMAIL_USER: string;

  @IsString()
  GMAIL_PASSWORD: string;

  @IsString()
  @IsOptional()
  FRONTEND_URL?: string = 'http://localhost:5173';

  @IsString()
  @IsOptional()
  BACKEND_URL?: string = 'http://localhost:3000';

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  PORT?: number = 3000;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  MIGRATIONS_RUN?: boolean = false;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Environment validation error: ${errors.toString()}`);
  }

  return validatedConfig;
}