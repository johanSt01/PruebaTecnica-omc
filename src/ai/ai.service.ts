import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Groq from 'groq-sdk';
import { Lead } from '../leads/entities/lead.entity';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly client: Groq | null = null;
  private readonly model: string;
  private readonly useMock: boolean;

  constructor(private readonly config: ConfigService) {
    const apiKey = this.config.get<string>('GROQ_API_KEY');
    this.model =
      this.config.get<string>('GROQ_MODEL') ?? 'llama-3.3-70b-versatile';

    if (apiKey) {
      this.client = new Groq({ apiKey });
      this.useMock = false;
      this.logger.log(`Groq client inicializado — modelo: ${this.model}`);
    } else {
      this.useMock = true;
      this.logger.warn('GROQ_API_KEY no definida — usando respuesta mock');
    }
  }

  async generateSummary(
    leads: Lead[],
    filters: Record<string, any>,
  ): Promise<object> {
    if (!leads.length) {
      return {
        resumen: 'No se encontraron leads con los filtros aplicados.',
        leads_analizados: 0,
        filtros: filters,
        generado_con: 'sistema',
      };
    }

    if (this.useMock) {
      return this.mockResponse(leads, filters);
    }

    const prompt = this.buildPrompt(leads, filters);

    try {
      const completion = await this.client!.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'Eres un analista de marketing digital experto. Responde siempre en español, de forma profesional y orientada a resultados.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      });

      const text = completion.choices[0]?.message?.content ?? 'Sin respuesta';

      return {
        resumen: text,
        leads_analizados: leads.length,
        filtros: filters,
        generado_con: `groq/${this.model}`,
        tokens_usados: completion.usage?.total_tokens ?? null,
      };
    } catch (error) {
      this.logger.error('Error al llamar Groq API', error);
      throw new ServiceUnavailableException('Error al generar resumen con IA');
    }
  }

  // ─── Construcción del prompt ──────────────────────────────────────────────
  private buildPrompt(leads: Lead[], filters: Record<string, any>): string {
    const resumen = leads.map((l) => ({
      nombre: l.nombre,
      fuente: l.fuente,
      producto: l.productoInteres ?? 'no especificado',
      presupuesto: l.presupuesto ? `$${l.presupuesto} USD` : 'no especificado',
      fecha: l.createdAt,
    }));

    return `
Analiza los siguientes ${leads.length} leads de la plataforma One Million Copy SAS.

FILTROS APLICADOS:
${JSON.stringify(filters, null, 2)}

DATOS DE LEADS:
${JSON.stringify(resumen, null, 2)}

Genera un resumen ejecutivo con estas secciones:
1. **Análisis general** — patrones observados en los leads
2. **Fuente principal** — canal con mejor rendimiento y por qué
3. **Presupuesto** — análisis del rango y promedio
4. **Recomendaciones** — 3 acciones concretas para mejorar la captación
5. **Conclusión** — una frase de cierre accionable

Sé conciso, profesional y orientado a resultados.
    `.trim();
  }

  // ─── Mock documentado ─────────────────────────────────────────────────────
  private mockResponse(leads: Lead[], filters: Record<string, any>): object {
    const fuenteCount: Record<string, number> = {};
    let totalPresupuesto = 0;
    let countConPresupuesto = 0;

    for (const l of leads) {
      fuenteCount[l.fuente] = (fuenteCount[l.fuente] ?? 0) + 1;
      if (l.presupuesto) {
        totalPresupuesto += Number(l.presupuesto);
        countConPresupuesto++;
      }
    }

    const fuentePrincipal = Object.entries(fuenteCount).sort(
      (a, b) => b[1] - a[1],
    )[0];
    const promedio = countConPresupuesto
      ? (totalPresupuesto / countConPresupuesto).toFixed(2)
      : 'N/A';

    return {
      resumen: `**MOCK** — configura GROQ_API_KEY para respuesta real.\n\nLeads analizados: ${leads.length}. Fuente principal: ${fuentePrincipal?.[0]} (${fuentePrincipal?.[1]} leads). Presupuesto promedio: $${promedio} USD.`,
      leads_analizados: leads.length,
      filtros: filters,
      generado_con: 'mock (sin API key)',
      nota: 'Configura GROQ_API_KEY en .env para usar Groq Cloud',
    };
  }
}
