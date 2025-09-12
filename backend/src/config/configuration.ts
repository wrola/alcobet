import { registerAs } from "@nestjs/config";
import * as Joi from "joi";

export interface AppConfig {
  port: number;
  nodeEnv: string;
  database: {
    url: string;
    migrationsRun: boolean;
  };
  google: {
    clientId: string;
    clientSecret: string;
  };
  session: {
    secret: string;
  };
  mail: {
    user: string;
    password: string;
  };
  urls: {
    frontend: string;
    backend: string;
  };
}

export const appConfig = registerAs(
  "app",
  (): AppConfig => ({
    port: parseInt(process.env.PORT, 10) || 3000,
    nodeEnv: process.env.NODE_ENV || "development",
    database: {
      url: process.env.DATABASE_URL || "./database.sqlite",
      migrationsRun: process.env.MIGRATIONS_RUN === "true",
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
    session: {
      secret: process.env.SESSION_SECRET,
    },
    mail: {
      user: process.env.GMAIL_USER,
      password: process.env.GMAIL_PASSWORD,
    },
    urls: {
      frontend: process.env.FRONTEND_URL || "http://localhost:5173",
      backend: process.env.BACKEND_URL || "http://localhost:3000",
    },
  }),
);

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid("development", "production", "test")
    .default("development"),
  PORT: Joi.number().port().default(3000),
  DATABASE_URL: Joi.string().default("./database.sqlite"),
  MIGRATIONS_RUN: Joi.boolean().default(false),
  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  SESSION_SECRET: Joi.string().min(32).required(),
  GMAIL_USER: Joi.string().email().required(),
  GMAIL_PASSWORD: Joi.string().required(),
  FRONTEND_URL: Joi.string().uri().default("http://localhost:5173"),
  BACKEND_URL: Joi.string().uri().default("http://localhost:3000"),
});
