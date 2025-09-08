import { IsEmail, IsNumber, IsDateString, Min } from 'class-validator';

export class CreateBetDto {
  @IsEmail()
  trustmanEmail: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsDateString()
  deadline: string;
}