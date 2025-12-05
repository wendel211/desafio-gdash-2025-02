import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Res,
  UseGuards
} from '@nestjs/common';

import { WeatherService } from './weather.service';
import { CreateWeatherDto } from './dto/create-weather.dto';
import { QueryWeatherDto } from './dto/query-weather.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Response } from 'express';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  /** 
   * Endpoint usado exclusivamente pelo worker Go
   * ❗ Não tem JWT
   */
  @Post('logs')
  create(@Body() dto: CreateWeatherDto) {
    return this.weatherService.create(dto);
  }

  /**
   * Listagem consumida pelo frontend (PROTEGIDA)
   */
  @UseGuards(JwtAuthGuard)
  @Get('logs')
  findAll(@Query() query: QueryWeatherDto) {
    return this.weatherService.findAll(query);
  }

  /**
   * 🤖 Listagem para o AI Service (SEM AUTENTICAÇÃO)
   * Usado apenas internamente pelo Docker network
   */
  @Get('logs/internal')
  findAllInternal(@Query() query: QueryWeatherDto) {
    return this.weatherService.findAll(query);
  }

  /**
   * 📌 Export CSV 
   */
  @UseGuards(JwtAuthGuard)
  @Get('export.csv')
  async exportCSV(@Res() res: Response) {
    const csv = await this.weatherService.exportCSV();

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="weather.csv"'
    );

    return res.send(csv);
  }

  /**
   * 📌 Export XLSX
   */
  @UseGuards(JwtAuthGuard)
  @Get('export.xlsx')
  async exportXLSX(@Res() res: Response) {
    const buffer = await this.weatherService.exportXLSX();

    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="weather.xlsx"',
    });

    return res.send(buffer);
  }

  /**
   * 🚀 Insights via IA-Service (COM CACHE)
   * Retorna do cache se disponível (30 min)
   */
  @UseGuards(JwtAuthGuard)
  @Get('insights')
  async generateInsights() {
    return this.weatherService.generateInsights();
  }

  /**
   * 🔄 Forçar regeneração de insights (IGNORA CACHE)
   * Use para botão "Atualizar Insights" no frontend
   */
  @UseGuards(JwtAuthGuard)
  @Post('insights/refresh')
  async refreshInsights() {
    return this.weatherService.regenerateInsights();
  }
}