import { Controller, Get, UseGuards } from '@nestjs/common';
import { InsightsService } from './insights.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Weather') // categoria que aparecerá no Swagger
@ApiBearerAuth()    // habilita campo de JWT
@Controller('weather')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @UseGuards(JwtAuthGuard)
  @Get('insights')
  @ApiOperation({ summary: 'Gerar insights climáticos via IA' })
  @ApiResponse({
    status: 200,
    description: 'Insights gerados com sucesso.',
    schema: {
      example: {
        message:
          'A temperatura está subindo gradualmente nas últimas horas, indicando possível mudança de clima.',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Token ausente ou inválido.',
  })
  getInsights() {
    return this.insightsService.generateInsights();
  }
}
