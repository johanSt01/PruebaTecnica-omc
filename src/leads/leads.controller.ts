import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

import { CreateLeadDto } from './dto/create-lead.dto';
import { Lead } from './entities/lead.entity';
import { LeadsService } from './leads.service';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createLeadDto: CreateLeadDto): Promise<Lead> {
    return await this.leadsService.create(createLeadDto);
  }
}
