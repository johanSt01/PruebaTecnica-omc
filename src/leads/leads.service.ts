import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateLeadDto } from './dto/create-lead.dto';
import { Lead } from './entities/lead.entity';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
  ) {}

  async create(createLeadDto: CreateLeadDto): Promise<Lead> {
    const existingLead = await this.leadRepository.findOne({
      where: {
        email: createLeadDto.email,
      },
    });

    if (existingLead) {
      throw new BadRequestException('Ya existe un lead con este email');
    }

    const lead = this.leadRepository.create(createLeadDto);

    return await this.leadRepository.save(lead);
  }
}
