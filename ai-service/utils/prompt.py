def build_insight_prompt(weather_data):
    return f"""
Você é um assistente especializado em análise ambiental.

Com base no histórico abaixo, gere:

1. Um resumo geral do clima
2. Tendências observadas (subida/queda de temperaturas, aumento de umidade, etc)
3. Possíveis alertas (chuva, calor extremo, etc)
4. Classificação final do clima do período (exemplo: "Agradável", "Alerta de chuva", "Calor extremo")

Histórico de clima:
{weather_data}

Retorne em JSON no formato:

{{
  "resumo": "...",
  "tendencias": ["...", "..."],
  "alertas": ["...", "..."],
  "classificacao": "..."
}}
"""
