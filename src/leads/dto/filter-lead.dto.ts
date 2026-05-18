import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { FuenteEnum } from '../entities/lead.entity';

export class FilterLeadDto {
  @ApiPropertyOptional({ example: 1, description: 'Número de página' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, description: 'Resultados por página' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ enum: FuenteEnum })
  @IsOptional()
  @IsEnum(FuenteEnum)
  fuente?: FuenteEnum;

  @ApiPropertyOptional({
    example: '2024-01-01',
    description: 'Fecha inicio (ISO)',
  })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({
    example: '2024-12-31',
    description: 'Fecha fin (ISO)',
  })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}

export class AiSummaryFilterDto {
  @ApiPropertyOptional({ enum: FuenteEnum })
  @IsOptional()
  @IsEnum(FuenteEnum)
  fuente?: FuenteEnum;

  @ApiPropertyOptional({ example: '2024-01-01' })
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @ApiPropertyOptional({ example: '2024-12-31' })
  @IsOptional()
  @IsDateString()
  fechaFin?: string;
}
