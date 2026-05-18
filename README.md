<div align="center">

# OMC Leads API

**Sistema de gestión de leads para creadores digitales**

_One Million Copy SAS — Prueba Técnica Backend_

---

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Groq](https://img.shields.io/badge/Groq_AI-F55036?style=for-the-badge&logo=groq&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)

</div>

---

## Contexto

**One Million Copy SAS** ayuda a creadores digitales a vender sus productos por internet. Esta API REST gestiona los **leads** (personas interesadas) que llegan desde distintos embudos de marketing, permitiendo registrarlos, consultarlos, filtrarlos y generar resúmenes ejecutivos con inteligencia artificial.

---

## 🛠 Tecnologías y por qué

| Tecnología          | Versión | Decisión                                                                                                            |
| ------------------- | ------- | ------------------------------------------------------------------------------------------------------------------- |
| **NestJS**          | v10     | Arquitectura modular, soporte nativo para Swagger, validaciones con decoradores y patrón MVC claro para code review |
| **TypeScript**      | v5      | Tipado fuerte, mejor DX, detección de errores en tiempo de compilación                                              |
| **PostgreSQL**      | v16     | Las queries de estadísticas (`GROUP BY`, promedios, rangos de fecha) son naturales en SQL                           |
| **TypeORM**         | v0.3    | ORM maduro para NestJS, maneja el schema automáticamente en desarrollo                                              |
| **Groq Cloud**      | —       | API gratuita, velocidad de inferencia superior, compatible con formato OpenAI                                       |
| **JWT**             | —       | Estándar de autenticación stateless para APIs REST                                                                  |
| **Swagger/OpenAPI** | v7      | Documentación interactiva generada automáticamente con decoradores                                                  |
| **Docker**          | —       | Entorno 100% reproducible, sin conflictos de versiones locales                                                      |

---

## Requisitos previos

- [Node.js](https://nodejs.org) **v20 o superior**
- [npm](https://npmjs.com) **v9 o superior**
- [Docker + Docker Compose](https://docker.com) _(opción A)_

---

## Instalación

### Opción A — Docker _(recomendado)_

> Levanta la API y la base de datos con un solo comando. No necesitas instalar PostgreSQL.

```bash
# 1. Clona el repositorio
git clone https://github.com/tu-usuario/omc-leads-api.git
cd omc-leads-api

# 2. Configura las variables de entorno
cp .env.example .env
# Edita .env con tus valores (ver sección Variables de entorno)

# 3. Levanta todos los servicios
docker compose up -d

# 4. Ejecuta el seed (datos de ejemplo)
npx ts-node src/database/seed.ts
```

API disponible en: `http://localhost:3000/api`
Swagger UI en: `http://localhost:3000/docs`

---

> \*Si `GROQ_API_KEY` no está configurada, el endpoint `/ai/summary` devuelve una respuesta **mock documentada** con el mismo formato. No hay errores ni bloqueos.

**Obtener Groq API Key (gratis):**

1. Ve a [console.groq.com](https://console.groq.com) y crea una cuenta
2. En el menú lateral → **API Keys** → **Create API Key**
3. Copia la key (empieza con `gsk_...`) y pégala en `.env`

---

## Ejecutar el Seed

El seed crea **12 leads de ejemplo** con distintas fuentes, presupuestos y fechas para poder probar todos los endpoints de inmediato.

```bash
# Local
npx run seed

# Con Docker
npx ts-node src/database/seed.ts
```

Ejemplo de salida:

```
Conexión a base de datos establecida
✓  Creado: Valentina Ríos (instagram)
✓  Creado: Camilo Herrera (facebook)
✓  Creado: Lucía Mendoza (landing_page)
...
🌱 Seed completado: 12 leads creados, 0 omitidos
```

---

## Autenticación

Todos los endpoints (excepto `/auth/login`) requieren un token **JWT Bearer**.

### Obtener el token

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "omc2024"}'
```

Respuesta:

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Usar el token

```bash
# En cada request agrega el header:
-H "Authorization: Bearer <access_token>"
```

**En Postman:** pestaña `Authorization` → tipo `Bearer Token` → pega el token.

**En Swagger:** botón `Authorize` (arriba a la derecha) → escribe `Bearer <token>`.

---

## Endpoints

Base URL: `http://localhost:3000/api/v1`

### Auth

| Método | Ruta          | Descripción       |
| ------ | ------------- | ----------------- |
| `POST` | `/auth/login` | Obtener token JWT |

### Leads

| Método   | Ruta                | Descripción                         |
| -------- | ------------------- | ----------------------------------- |
| `POST`   | `/leads`            | Crear nuevo lead                    |
| `GET`    | `/leads`            | Listar leads (paginación + filtros) |
| `GET`    | `/leads/stats`      | Estadísticas generales              |
| `GET`    | `/leads/:id`        | Obtener lead por ID                 |
| `PATCH`  | `/leads/:id`        | Actualizar lead                     |
| `DELETE` | `/leads/:id`        | Eliminar lead (soft delete)         |
| `POST`   | `/leads/ai/summary` | Resumen ejecutivo con IA            |
| `POST`   | `/leads/webhook`    | Webhook simulando Typeform          |

---

### Ejemplos de uso

**Crear lead**

```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "María López",
    "email": "maria@example.com",
    "telefono": "+573001234567",
    "fuente": "instagram",
    "productoInteres": "Curso de Marketing Digital",
    "presupuesto": 350
  }'
```

**Listar con filtros**

```bash
# Por fuente
curl "http://localhost:3000/api/leads?fuente=instagram" \
  -H "Authorization: Bearer <TOKEN>"

# Con paginación
curl "http://localhost:3000/api/leads?page=1&limit=5" \
  -H "Authorization: Bearer <TOKEN>"

# Por rango de fechas
curl "http://localhost:3000/api/leads?fechaInicio=2024-01-01&fechaFin=2024-12-31" \
  -H "Authorization: Bearer <TOKEN>"

# Combinado
curl "http://localhost:3000/api/leads?fuente=facebook&page=1&limit=10" \
  -H "Authorization: Bearer <TOKEN>"
```

**Estadísticas**

```bash
curl http://localhost:3000/api/leads/stats \
  -H "Authorization: Bearer <TOKEN>"
```

Respuesta:

```json
{
  "total": 12,
  "porFuente": [
    { "fuente": "instagram", "total": 3 },
    { "fuente": "facebook", "total": 3 },
    { "fuente": "landing_page", "total": 3 }
  ],
  "promedioPresupuesto": 573.18,
  "ultimosSieteDias": 4
}
```

**Resumen IA con Groq**

```bash
# Todos los leads
curl -X POST http://localhost:3000/api/leads/ai/summary \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{}'

# Filtrado por fuente y fecha
curl -X POST http://localhost:3000/api/leads/ai/summary \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "fuente": "instagram",
    "fechaInicio": "2024-01-01",
    "fechaFin": "2024-12-31"
  }'
```

**Webhook (simula Typeform)**

```bash
curl -X POST http://localhost:3000/api/leads/webhook \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "form_response": {
      "answers": [
        { "field": { "ref": "nombre" }, "text": "Juan Prueba" },
        { "field": { "ref": "email" }, "email": "juan.prueba@example.com" },
        { "field": { "ref": "fuente" }, "choice": { "label": "instagram" } },
        { "field": { "ref": "presupuesto" }, "number": 400 }
      ]
    }
  }'
```

---

## Integración IA — Groq

El endpoint `POST /leads/ai/summary` usa **Groq Cloud** para generar un resumen ejecutivo de los leads filtrados.

**Arquitectura del flujo:**

```
Request → Filtros opcionales
       → LeadsService.getLeadsForAi()   ← consulta DB (máx. 100 leads)
       → AiService.generateSummary()    ← construye prompt + llama Groq
       → Groq API (llama-3.3-70b)       ← genera análisis en español
       → Response con resumen ejecutivo
```

**El resumen incluye:**

- Análisis general de patrones
- Fuente con mejor rendimiento
- Análisis de presupuestos
- 3 recomendaciones concretas
- Conclusión accionable

> **Sin API key:** el sistema detecta automáticamente la ausencia de `GROQ_API_KEY` y retorna un mock con el mismo formato, calculado con los datos reales. La arquitectura está lista para conectar cualquier LLM compatible con el formato OpenAI (OpenAI, Together, Ollama, etc.).

---

## Tests

```bash
# Ejecutar todos los tests
npm test

# Con reporte de cobertura
npm run test:cov

# Modo watch (re-ejecuta al guardar)
npm run test:watch
```

---

## Valores permitidos

**Campo `fuente`:**

```
instagram | facebook | landing_page | referido | otro
```

---

## Manejo de errores

Todos los errores siguen el mismo formato:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": ["El email no tiene un formato válido"],
  "timestamp": "2024-05-18T17:30:00.000Z",
  "path": "/api/v1/leads"
}
```

| Código | Cuándo ocurre                    |
| ------ | -------------------------------- |
| `400`  | Datos inválidos o faltantes      |
| `401`  | Token JWT ausente o expirado     |
| `404`  | Lead no encontrado               |
| `409`  | Email ya registrado              |
| `429`  | Rate limit excedido (60 req/min) |
| `500`  | Error interno del servidor       |

---

<div align="center">

**One Million Copy SAS — Prueba Técnica Backend**

_Construido en NestJS + TypeScript_

</div>
