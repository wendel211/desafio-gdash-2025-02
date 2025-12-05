import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';

import { IntegrationService } from './integration.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ListQueryDto } from './dto/list-query.dto';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('Integration')
@ApiBearerAuth()
@Controller('integration')
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  // -------------------------
  // LISTAGEM DE POKÉMONS
  // -------------------------
  @UseGuards(JwtAuthGuard)
  @Get('pokemon')
  @ApiOperation({ summary: 'Listar Pokémons da API externa (PokeAPI)' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    example: 20,
    description: 'Quantidade de registros a retornar',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    example: 0,
    description: 'Número de registros para pular (paginação)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de Pokémons retornada com sucesso.',
    schema: {
      example: {
        count: 1302,
        next: 'https://pokeapi.co/api/v2/pokemon?offset=20&limit=20',
        previous: null,
        results: [
          { name: 'bulbasaur', url: 'https://pokeapi.co/api/v2/pokemon/1/' },
          { name: 'ivysaur', url: 'https://pokeapi.co/api/v2/pokemon/2/' },
        ],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token inválido ou ausente.' })
  list(@Query() query: ListQueryDto) {
    const limit = query.limit ? Number(query.limit) : 20;
    const offset = query.offset ? Number(query.offset) : 0;

    return this.integrationService.list(limit, offset);
  }

  // -------------------------
  // DETALHES DE UM POKÉMON
  // -------------------------
  @UseGuards(JwtAuthGuard)
  @Get('pokemon/:name')
  @ApiOperation({ summary: 'Obter detalhes de um Pokémon pelo nome' })
  @ApiParam({
    name: 'name',
    type: String,
    example: 'pikachu',
    description: 'Nome do Pokémon',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalhes retornados com sucesso.',
    schema: {
      example: {
        id: 25,
        name: 'pikachu',
        height: 4,
        weight: 60,
        sprites: {
          front_default:
            'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Pokémon não encontrado.' })
  @ApiResponse({ status: 401, description: 'Token inválido ou ausente.' })
  detail(@Param('name') name: string) {
    return this.integrationService.detail(name);
  }
}
