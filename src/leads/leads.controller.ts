import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AiService } from '../ai/ai.service';

import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { AiSummaryFilterDto, FilterLeadDto } from './dto/filter-lead.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import { Lead } from './entities/lead.entity';
import { LeadsService } from './leads.service';

@ApiTags('Leads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadsController {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly aiService: AiService,
  ) {}

  // ─── CREATE ─────
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo lead' })
  @ApiResponse({ status: 201, description: 'Lead creado correctamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  async create(@Body() createLeadDto: CreateLeadDto): Promise<Lead> {
    return await this.leadsService.create(createLeadDto);
  }

  // GET /leads/stats
  @Get('stats')
  @ApiOperation({ summary: 'Estadísticas generales de leads' })
  getStats() {
    return this.leadsService.getStats();
  }

  // POST /leads/ai/summary
  @Post('ai/summary')
  @ApiOperation({ summary: 'Generar resumen ejecutivo con IA' })
  @ApiResponse({ status: 200, description: 'Resumen generado por el LLM' })
  async aiSummary(@Body() filters: AiSummaryFilterDto) {
    const leads = await this.leadsService.getLeadsForAi(
      filters.fuente,
      filters.fechaInicio,
      filters.fechaFin,
    );
    return this.aiService.generateSummary(leads, filters);
  }

  // POST /leads/webhook (bonus: simula Typeform)
  @Post('webhook')
  @ApiOperation({ summary: 'Webhook simulando Typeform' })
  webhookTypeform(@Body() body: any) {
    // Typeform envía los datos en body.form_response.answers
    const answers = body?.form_response?.answers ?? [];
    const dto: Partial<CreateLeadDto> = {};

    for (const answer of answers) {
      const field = answer.field?.ref;
      if (field === 'nombre') dto.nombre = answer.text;
      if (field === 'email') dto.email = answer.email;
      if (field === 'telefono') dto.telefono = answer.phone_number;
      if (field === 'fuente') dto.fuente = answer.choice?.label;
      if (field === 'presupuesto') dto.presupuesto = answer.number;
    }

    return this.leadsService.create(dto as CreateLeadDto);
  }

  // ─── FIND ALL (with pagination & filters) ─────
  @Get()
  @ApiOperation({ summary: 'Listar leads con filtros y paginación' })
  @ApiResponse({ status: 200, description: 'Listado de leads' })
  async findAll(@Query() filters: FilterLeadDto) {
    return this.leadsService.findAll(filters);
  }

  // GET /leads/:id
  @Get(':id')
  @ApiOperation({ summary: 'Obtener un lead por ID' })
  @ApiResponse({ status: 404, description: 'Lead no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.leadsService.findOne(id);
  }

  // PATCH /leads/:id
  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un lead existente' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLeadDto: UpdateLeadDto,
  ) {
    return this.leadsService.update(id, updateLeadDto);
  }

  // DELETE /leads/:id
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un lead (soft delete)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.leadsService.remove(id);
  }
}
