from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx
import os
import json
from typing import List, Optional

app = FastAPI()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
NEST_API_URL = os.getenv("NEST_API_URL", "http://api:3000")


class WeatherLog(BaseModel):
    temperature: float
    humidity: float
    wind_speed: float
    condition: str
    timestamp: str

@app.get("/health")
def health():
    """Health check endpoint"""
    return {"status": "ok", "service": "AI Weather Insights"}


@app.post("/generate-insights")
async def generate_insights():
    """
    Gera insights inteligentes baseados nos logs climáticos
    Busca os dados diretamente da API NestJS
    """
    
    if not OPENAI_API_KEY:
        return {
            "success": False,
            "error": "OPENAI_API_KEY não configurada",
            "fallback": True,
            "message": "Configure a chave da OpenAI para habilitar insights de IA."
        }
    
    try:

        print("📡 Buscando dados climáticos da API...")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(f"{NEST_API_URL}/api/weather/logs/internal")
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail="Erro ao buscar dados da API"
                )
            
            logs = response.json()
        
        if not logs or len(logs) == 0:
            return {
                "success": False,
                "message": "Não há dados climáticos suficientes para análise.",
                "resumo": "Aguardando coleta de dados...",
                "tendencias": [],
                "alertas": [],
                "classificacao": "Sem dados"
            }
        
      
        recent_logs = logs[:20] if len(logs) > 20 else logs
        
        # Calcular estatísticas básicas
        temps = [log['temperature'] for log in recent_logs]
        humidities = [log['humidity'] for log in recent_logs]
        winds = [log['wind_speed'] for log in recent_logs]
        
        avg_temp = sum(temps) / len(temps)
        avg_humidity = sum(humidities) / len(humidities)
        avg_wind = sum(winds) / len(winds)
        
        min_temp = min(temps)
        max_temp = max(temps)
        
     
        prompt = f"""Você é um especialista em análise meteorológica. Analise os seguintes dados climáticos e gere insights úteis.

📊 ESTATÍSTICAS DOS ÚLTIMOS {len(recent_logs)} REGISTROS:

Temperatura:
- Média: {avg_temp:.1f}°C
- Mínima: {min_temp:.1f}°C
- Máxima: {max_temp:.1f}°C
- Variação: {max_temp - min_temp:.1f}°C

Umidade:
- Média: {avg_humidity:.1f}%

Vento:
- Média: {avg_wind:.1f} km/h

Condições observadas:
{', '.join(set(log['condition'] for log in recent_logs[:5]))}

📈 HISTÓRICO DETALHADO (5 registros mais recentes):
{json.dumps([{
    'temp': log['temperature'],
    'umidade': log['humidity'],
    'vento': log['wind_speed'],
    'condicao': log['condition']
} for log in recent_logs[:5]], indent=2, ensure_ascii=False)}

🎯 TAREFA:
Gere uma análise completa retornando um JSON válido com esta estrutura EXATA:

{{
  "resumo": "Frase resumindo o clima atual (30-50 palavras)",
  "tendencias": [
    "Tendência 1 observada",
    "Tendência 2 observada",
    "Tendência 3 observada"
  ],
  "alertas": [
    "Alerta importante (se houver)",
    "Outro alerta (se houver)"
  ],
  "classificacao": "Uma palavra: Agradável | Quente | Frio | Instável | Chuvoso | Ventoso"
}}

REGRAS IMPORTANTES:
- Use português BR
- Seja preciso e útil
- Se não houver alertas, retorne array vazio []
- Sempre inclua 2-3 tendências
- A classificação deve ser UMA palavra apenas
- Responda APENAS com o JSON, sem texto adicional"""

        # 4️⃣ CHAMAR A API DA OPENAI
        print("🤖 Enviando prompt para OpenAI...")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            openai_response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {
                            "role": "system",
                            "content": "Você é um assistente especializado em análise meteorológica. Sempre retorne respostas em JSON válido."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": 0.7,
                    "max_tokens": 500
                }
            )
        
        if openai_response.status_code != 200:
            print(f"❌ Erro OpenAI: {openai_response.status_code}")
            print(f"Resposta: {openai_response.text}")
            raise HTTPException(
                status_code=openai_response.status_code,
                detail=f"Erro na API da OpenAI: {openai_response.text}"
            )
        
        result = openai_response.json()
        ai_text = result["choices"][0]["message"]["content"]
        
        print("✅ Resposta recebida da OpenAI")
        print(f"📝 Texto: {ai_text[:200]}...")
        
        # 5️⃣ PARSEAR O JSON RETORNADO PELA IA
        try:
            # Remove markdown code blocks se houver
            clean_text = ai_text.strip()
            if clean_text.startswith("```json"):
                clean_text = clean_text[7:]
            if clean_text.startswith("```"):
                clean_text = clean_text[3:]
            if clean_text.endswith("```"):
                clean_text = clean_text[:-3]
            
            clean_text = clean_text.strip()
            
            insights = json.loads(clean_text)
            
            # Validar estrutura
            if not all(key in insights for key in ["resumo", "tendencias", "alertas", "classificacao"]):
                raise ValueError("JSON não possui todas as chaves necessárias")
            
            return {
                "success": True,
                "resumo": insights["resumo"],
                "tendencias": insights["tendencias"],
                "alertas": insights["alertas"],
                "classificacao": insights["classificacao"],
                "metadata": {
                    "registros_analisados": len(recent_logs),
                    "temperatura_media": round(avg_temp, 1),
                    "umidade_media": round(avg_humidity, 1)
                }
            }
            
        except json.JSONDecodeError as e:
            print(f"⚠️ Erro ao parsear JSON da IA: {e}")
            print(f"Texto recebido: {ai_text}")
            
            # Fallback: retornar o texto bruto
            return {
                "success": True,
                "resumo": ai_text[:200],
                "tendencias": ["Análise textual gerada pela IA"],
                "alertas": [],
                "classificacao": "Análise disponível",
                "raw_response": ai_text
            }
    
    except httpx.HTTPError as e:
        print(f"❌ Erro de conexão: {e}")
        return {
            "success": False,
            "error": str(e),
            "fallback": True,
            "message": "Erro ao conectar com os serviços. Tente novamente."
        }
    
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        return {
            "success": False,
            "error": str(e),
            "fallback": True,
            "message": "Erro ao gerar insights. Verifique os logs do servidor."
        }


@app.post("/generate")
async def generate_simple(temperature: float, humidity: float, wind: float, condition: str):
    """
    Endpoint legado mantido para compatibilidade
    Gera insight simples baseado em um único dado
    """
    
    if not OPENAI_API_KEY:
        return {
            "message": "Configure OPENAI_API_KEY para habilitar insights de IA."
        }
    
    try:
        prompt = f"""Analise este dado climático e gere um insight curto (1 frase):

Temperatura: {temperature}°C
Umidade: {humidity}%
Vento: {wind} km/h
Condição: {condition}

Seja direto e útil."""

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "gpt-4o-mini",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.7,
                    "max_tokens": 100
                }
            )
        
        result = response.json()
        message = result["choices"][0]["message"]["content"]
        
        return {"message": message}
    
    except Exception as e:
        return {"message": f"Erro ao gerar insight: {str(e)}"}