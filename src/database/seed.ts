import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Lead, FuenteEnum } from '../leads/entities/lead.entity';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT) ?? 5432,
  username: process.env.DATABASE_USER ?? 'admin',
  password: process.env.DATABASE_PASS ?? 'root',
  database: process.env.DATABASE_NAME ?? 'omc_leads',
  entities: [Lead],
  synchronize: true,
});

const SEED_LEADS = [
  {
    nombre: 'Valentina Ríos',
    email: 'valentina.rios@gmail.com',
    telefono: '+573001234567',
    fuente: FuenteEnum.INSTAGRAM,
    productoInteres: 'Curso de Marketing Digital',
    presupuesto: 350,
  },
  {
    nombre: 'Camilo Herrera',
    email: 'camilo.herrera@hotmail.com',
    telefono: '+573112345678',
    fuente: FuenteEnum.FACEBOOK,
    productoInteres: 'Mentoría 1 a 1',
    presupuesto: 800,
  },
  {
    nombre: 'Lucía Mendoza',
    email: 'lucia.mendoza@outlook.com',
    fuente: FuenteEnum.LANDING_PAGE,
    productoInteres: 'Curso de Copywriting',
    presupuesto: 250,
  },
  {
    nombre: 'Andrés Castillo',
    email: 'andres.castillo@gmail.com',
    telefono: '+573209876543',
    fuente: FuenteEnum.REFERIDO,
    productoInteres: 'Programa Acelerador',
    presupuesto: 1200,
  },
  {
    nombre: 'Sofía Vargas',
    email: 'sofia.vargas@yahoo.com',
    fuente: FuenteEnum.INSTAGRAM,
    productoInteres: 'Ebook de Embudos',
    presupuesto: 50,
  },
  {
    nombre: 'Miguel Torres',
    email: 'miguel.torres@gmail.com',
    telefono: '+573145678901',
    fuente: FuenteEnum.FACEBOOK,
    productoInteres: 'Curso de Ads',
    presupuesto: 600,
  },
  {
    nombre: 'Isabella Gómez',
    email: 'isabella.gomez@icloud.com',
    fuente: FuenteEnum.LANDING_PAGE,
    productoInteres: 'Consultoría Estratégica',
    presupuesto: 2000,
  },
  {
    nombre: 'Sebastián Mora',
    email: 'sebastian.mora@gmail.com',
    telefono: '+573056789012',
    fuente: FuenteEnum.OTRO,
    productoInteres: 'Curso de Email Marketing',
    presupuesto: 180,
  },
  {
    nombre: 'Natalia Ruiz',
    email: 'natalia.ruiz@hotmail.com',
    fuente: FuenteEnum.REFERIDO,
    productoInteres: 'Mentoría Grupal',
    presupuesto: 450,
  },
  {
    nombre: 'Felipe Salazar',
    email: 'felipe.salazar@gmail.com',
    telefono: '+573167890123',
    fuente: FuenteEnum.INSTAGRAM,
    productoInteres: 'Programa Acelerador',
    presupuesto: 900,
  },
  {
    nombre: 'Daniela Pérez',
    email: 'daniela.perez@outlook.com',
    fuente: FuenteEnum.FACEBOOK,
    productoInteres: 'Curso de Ventas por WhatsApp',
    presupuesto: 320,
  },
  {
    nombre: 'Julián Castro',
    email: 'julian.castro@gmail.com',
    telefono: '+573178901234',
    fuente: FuenteEnum.LANDING_PAGE,
    // sin productoInteres ni presupuesto — para testear nullables
  },
];

async function seed() {
  try {
    await dataSource.initialize();
    console.log('Conexión a base de datos establecida');

    const repo = dataSource.getRepository(Lead);

    let creados = 0;
    let omitidos = 0;

    for (const data of SEED_LEADS) {
      const exists = await repo.findOne({ where: { email: data.email } });
      if (exists) {
        console.log(`Ya existe: ${data.email}`);
        omitidos++;
        continue;
      }
      const lead = repo.create(data);
      await repo.save(lead);
      console.log(`Creado: ${data.nombre} (${data.fuente})`);
      creados++;
    }

    console.log(
      `\n🌱 Seed completado: ${creados} leads creados, ${omitidos} omitidos\n`,
    );
  } catch (err) {
    console.error('Error en seed:', err);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

seed();
