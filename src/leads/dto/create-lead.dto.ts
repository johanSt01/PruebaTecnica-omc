import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

import { FuenteEnum } from '../entities/lead.entity';

export class CreateLeadDto {
  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo del lead',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre: string;

  @ApiProperty({
    example: 'juan@example.com',
    description: 'Email único del lead',
  })
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  email: string;

  @ApiPropertyOptional({ example: '+573001234567' })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiProperty({ enum: FuenteEnum, example: FuenteEnum.INSTAGRAM })
  @IsEnum(FuenteEnum, {
    message: `La fuente debe ser uno de: ${Object.values(FuenteEnum).join(', ')}`,
  })
  @IsNotEmpty({ message: 'La fuente es obligatoria' })
  fuente: FuenteEnum;

  @ApiPropertyOptional({ example: 'Curso de Marketing Digital' })
  @IsOptional()
  @IsString()
  productoInteres?: string;

  @ApiPropertyOptional({ example: 500, description: 'Presupuesto en USD' })
  @IsOptional()
  @IsNumber({}, { message: 'El presupuesto debe ser un número' })
  @Min(0, { message: 'El presupuesto no puede ser negativo' })
  presupuesto?: number;
}
