import schedule
import time
import os
from weather_service import WeatherService
from queue_service import QueueService

def start_scheduler():
    print("🔧 Iniciando coletor...")

    weather = WeatherService()

    # Aguarda RabbitMQ subir
    queue = None
    while queue is None:
        try:
            queue = QueueService()
            print("🐇 Conectado ao RabbitMQ!")
        except Exception as e:
            print("⏳ Aguardando RabbitMQ:", e)
            time.sleep(3)

    # Lê o intervalo corretamente
    interval = int(os.getenv("COLLECTOR_INTERVAL", 60))

    def job():
        try:
            data = weather.fetch_weather()
            print("📤 Dados coletados:", data)
            queue.send(data)
        except Exception as e:
            print("❌ Erro no job do coletor:", e)

    schedule.every(interval).seconds.do(job)

    print(f"⏳ Coletor ativo — executando a cada {interval} segundos.")

    while True:
        schedule.run_pending()
        time.sleep(1)
