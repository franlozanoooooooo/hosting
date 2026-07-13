import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Necesario para los webhooks: conservamos el body crudo para verificar firmas.
    bodyParser: true,
  });

  // Seguridad de cabeceras HTTP.
  app.use(helmet());

  // Parseo de cookies (donde viajan los tokens httpOnly).
  app.use(cookieParser());

  // CORS hacia la web (Next.js) con credenciales para enviar/recibir cookies.
  // WEB_ORIGIN admite varios orígenes separados por comas (local + producción).
  const origins = (process.env.WEB_ORIGIN ?? "http://localhost:3000")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({
    origin: origins.length === 1 ? origins[0] : origins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // Validación global. Zod se usa en los servicios; aquí dejamos el pipe
  // estándar de Nest para DTOs que lo requieran.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Todas las rutas cuelgan de /api.
  app.setGlobalPrefix("api");

  // ───────── Swagger (opcional) ─────────
  // import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
  // const config = new DocumentBuilder()
  //   .setTitle("API Club Atlético Antoniano")
  //   .setDescription("Gestión de cantera, cuotas y pagos")
  //   .setVersion("0.1.0")
  //   .addCookieAuth("access_token")
  //   .build();
  // const document = SwaggerModule.createDocument(app, config);
  // SwaggerModule.setup("api/docs", app, document);

  // Railway/PaaS inyectan PORT; en local usamos API_PORT (4000).
  const port = Number(process.env.PORT ?? process.env.API_PORT ?? 4000);
  await app.listen(port);
  Logger.log(`API escuchando en http://localhost:${port}/api`, "Bootstrap");
}

bootstrap();
