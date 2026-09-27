import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateNeedRequestDto {
  @IsOptional() @IsUUID() categoryId?: string;

  @IsString() @MaxLength(120) brandName!: string;
  @IsString() @MaxLength(120) productName!: string;
  @IsOptional() @IsString() @MaxLength(120) modelLabel?: string;
  @IsString() @MaxLength(120) partName!: string;

  @IsOptional() @IsString() @MaxLength(2000) description?: string;
  @IsOptional() @IsString() @MaxLength(120) location?: string;
}
