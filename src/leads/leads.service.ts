import {
  BadRequestException,
  NotFoundException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';

import { CreateLeadDto } from './dto/create-lead.dto';
import { FilterLeadDto } from './dto/filter-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { Lead } from './entities/lead.entity';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepo: Repository<Lead>,
  ) {}

  async create(createLeadDto: CreateLeadDto): Promise<Lead> {
    const existingLead = await this.leadRepo.findOne({
      where: {
        email: createLeadDto.email,
      },
    });

    if (existingLead) {
      throw new BadRequestException('Ya existe un lead con este email');
    }

    const lead = this.leadRepo.create(createLeadDto);

    return await this.leadRepo.save(lead);
  }

  // ─── FIND ALL (with pagination & filters) ─────────────────────────────────
  async findAll(filters: FilterLeadDto) {
    const { page = 1, limit = 10, fuente, fechaInicio, fechaFin } = filters;

    const query = this.leadRepo
      .createQueryBuilder('lead')
      .where('lead.deleted = :deleted', { deleted: false })
      .orderBy('lead.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (fuente) {
      query.andWhere('lead.fuente = :fuente', { fuente });
    }

    if (fechaInicio && fechaFin) {
      query.andWhere('lead.createdAt BETWEEN :inicio AND :fin', {
        inicio: new Date(fechaInicio),
        fin: new Date(new Date(fechaFin).setHours(23, 59, 59, 999)),
      });
    } else if (fechaInicio) {
      query.andWhere('lead.createdAt >= :inicio', {
        inicio: new Date(fechaInicio),
      });
    } else if (fechaFin) {
      query.andWhere('lead.createdAt <= :fin', {
        fin: new Date(new Date(fechaFin).setHours(23, 59, 59, 999)),
      });
    }

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ─── FIND ONE ─────────────────────────────────────────────────────────────
  async findOne(id: string): Promise<Lead> {
    const lead = await this.leadRepo.findOne({ where: { id, deleted: false } });
    if (!lead) throw new NotFoundException(`Lead con id '${id}' no encontrado`);
    return lead;
  }

  // ─── UPDATE ───────────────────────────────────────────────────────────────
  async update(id: string, dto: UpdateLeadDto): Promise<Lead> {
    const lead = await this.findOne(id);

    if (dto.email && dto.email !== lead.email) {
      const emailTaken = await this.leadRepo.findOne({
        where: { email: dto.email, deleted: false },
      });
      if (emailTaken) {
        throw new ConflictException(`El email '${dto.email}' ya está en uso`);
      }
    }

    Object.assign(lead, dto);
    return this.leadRepo.save(lead);
  }

  // ─── SOFT DELETE ──────────────────────────────────────────────────────────
  async remove(id: string): Promise<{ message: string }> {
    const lead = await this.findOne(id);
    lead.deleted = true;
    await this.leadRepo.save(lead);
    return { message: `Lead '${lead.nombre}' eliminado correctamente` };
  }

  // ─── STATS ────────────────────────────────────────────────────────────────
  async getStats() {
    const total = await this.leadRepo.count({ where: { deleted: false } });

    const porFuente = await this.leadRepo
      .createQueryBuilder('lead')
      .select('lead.fuente', 'fuente')
      .addSelect('COUNT(*)', 'total')
      .where('lead.deleted = false')
      .groupBy('lead.fuente')
      .getRawMany();

    const presupuestoResult = await this.leadRepo
      .createQueryBuilder('lead')
      .select('AVG(lead.presupuesto)', 'promedio')
      .where('lead.deleted = false AND lead.presupuesto IS NOT NULL')
      .getRawOne();

    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);

    const ultimosSieteDias = await this.leadRepo.count({
      where: {
        deleted: false,
        createdAt: Between(hace7Dias, new Date()),
      },
    });

    return {
      total,
      porFuente: porFuente.map((r) => ({
        fuente: r.fuente,
        total: Number(r.total),
      })),
      promedioPresupuesto: presupuestoResult?.promedio
        ? parseFloat(Number(presupuestoResult.promedio).toFixed(2))
        : null,
      ultimosSieteDias,
    };
  }

  // ─── GET LEADS FOR AI ─────────────────────────────────────────────────────
  async getLeadsForAi(
    fuente?: string,
    fechaInicio?: string,
    fechaFin?: string,
  ): Promise<Lead[]> {
    const query = this.leadRepo
      .createQueryBuilder('lead')
      .where('lead.deleted = false')
      .orderBy('lead.createdAt', 'DESC')
      .take(100); // límite para no sobrecargar el LLM

    if (fuente) query.andWhere('lead.fuente = :fuente', { fuente });
    if (fechaInicio)
      query.andWhere('lead.createdAt >= :inicio', {
        inicio: new Date(fechaInicio),
      });
    if (fechaFin)
      query.andWhere('lead.createdAt <= :fin', {
        fin: new Date(new Date(fechaFin).setHours(23, 59, 59, 999)),
      });

    return query.getMany();
  }
}
