import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class IntegrationService {
  private BASE_URL = 'https://pokeapi.co/api/v2/pokemon';

  async list(limit = 20, offset = 0) {
    const url = `${this.BASE_URL}?limit=${limit}&offset=${offset}`;
    const { data } = await axios.get(url);

    return {
      count: data.count,
      next: data.next,
      previous: data.previous,
      results: data.results,
    };
  }

  async detail(name: string) {
    const url = `${this.BASE_URL}/${name}`;
    const { data } = await axios.get(url);

    return {
      id: data.id,
      name: data.name,
      height: data.height,
      weight: data.weight,
      sprites: data.sprites,
      stats: data.stats,
      types: data.types,
    };
  }
}
