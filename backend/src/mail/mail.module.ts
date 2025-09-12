import { Module } from "@nestjs/common";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { join } from "path";
import { MailService } from "./mail.service";

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          service: "gmail",
          auth: {
            user: configService.get<string>("app.mail.user"),
            pass: configService.get<string>("app.mail.password"),
          },
        },
        defaults: {
          from: '"AlcoBet App" <noreply@alcobet.com>',
        },
        template: {
          dir: join(__dirname, "templates"),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
