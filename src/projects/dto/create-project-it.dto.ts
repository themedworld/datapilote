import { IsOptional, IsString, IsNumber, IsDecimal, IsInt } from 'class-validator';

export class ProjectITDto {
  // 🔹 Infos techniques
  @IsOptional()
  @IsString()
  programmingLanguages?: string; // TypeScript, Python, Java

  @IsOptional()
  @IsString()
  framework?: string; // React, NestJS, Django, Spring

  @IsOptional()
  @IsString()
  database?: string; // PostgreSQL, MySQL, MongoDB

  @IsOptional()
  @IsString()
  serverDetails?: string; // AWS EC2, Docker, Kubernetes

  @IsOptional()
  @IsString()
  architecture?: string; // Microservices, Monolith, Serverless

  @IsOptional()
  @IsString()
  apiIntegration?: string; // REST, GraphQL, SOAP

  @IsOptional()
  @IsString()
  securityRequirements?: string; // OAuth2, JWT, SSL/TLS

  @IsOptional()
  @IsString()
  devOpsRequirements?: string; // CI/CD, Docker, Jenkins

  // 🔹 Infos pour planification et estimation
  @IsOptional()
  @IsInt()
  estimatedDurationDays?: number; // durée estimée en jours

  @IsOptional()
  @IsDecimal()
  estimatedCost?: number; // coût estimé

  @IsOptional()
  @IsString()
  priority?: string; // High, Medium, Low

  @IsOptional()
  @IsString()
  businessImpact?: string; // Critical, Important, Normal

  @IsOptional()
  @IsInt()
  teamSize?: number; // nombre de membres nécessaires

  @IsOptional()
  @IsString()
  complexity?: string; // Low, Medium, High

  // 🔹 Découpage des modules et livrables
  @IsOptional()
  @IsString()
  mainModules?: string; // Auth, Payment, Dashboard, etc.

  @IsOptional()
  @IsString()
  keyDeliverables?: string; // API v1, Frontend v1

  @IsOptional()
  @IsString()
  dependencies?: string; // autres projets ou services nécessaires

  @IsOptional()
  @IsString()
  risks?: string; // risques identifiés (retard, bug critique, etc.)

  @IsOptional()
  @IsString()
  additionalNotes?: string; // infos diverses, remarques, liens docs
}
