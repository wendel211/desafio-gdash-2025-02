import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { Loading } from "../components/ui/loading";
import { useToast } from "../components/ui/toast";
import {
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Info,
  ThermometerSun,
  Wind,
  Droplets,
  CloudSun
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/card";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { Button } from "../components/ui/button";

// ITEM DE INSIGHT
const InsightItem = ({ icon: Icon, text, colorClass }: any) => (
  <li className={`flex items-start gap-2 text-sm ${colorClass}`}>
    <Icon className="mt-0.5 h-4 w-4 shrink-0 opacity-70" />
    <span>{text}</span>
  </li>
);

export default function Dashboard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingInsights, setRefreshingInsights] = useState(false);

  const { showToast } = useToast();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [condition, setCondition] = useState("all");
  const [tempMin, setTempMin] = useState(0);
  const [tempMax, setTempMax] = useState(60);

  // === LÓGICA ORIGINAL PRESERVADA ===
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const logsRes = await api.get("/weather/logs");
        const insightsRes = await api.get("/weather/insights");

        setLogs(logsRes.data);
        setFilteredLogs(logsRes.data);
        setInsights(insightsRes.data);
      } catch (err) {
        showToast("Erro ao carregar dados do dashboard", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function refreshInsights() {
    try {
      setRefreshingInsights(true);
      const response = await api.post("/weather/insights/refresh");
      setInsights(response.data);
      showToast("Insights atualizados com sucesso!", "success");
    } catch (err) {
      showToast("Erro ao atualizar insights", "error");
    } finally {
      setRefreshingInsights(false);
    }
  }

  function applyFilters() {
    let list = [...logs];
    if (startDate) list = list.filter((l) => new Date(l.timestamp) >= new Date(startDate));
    if (endDate) list = list.filter((l) => new Date(l.timestamp) <= new Date(endDate + " 23:59:59"));
    if (condition !== "all") list = list.filter((l) => l.condition === condition);
    list = list.filter((l) => l.temperature >= tempMin && l.temperature <= tempMax);

    setFilteredLogs(list);
    showToast("Filtros aplicados!", "success");
  }

  function resetFilters() {
    setStartDate("");
    setEndDate("");
    setCondition("all");
    setTempMin(0);
    setTempMax(60);
    setFilteredLogs(logs);
    showToast("Filtros limpos.", "success");
  }

  async function downloadCSV() {
    try {
      const response = await api.get("/weather/export.csv", {
        responseType: "blob",
        headers: {
          Accept: "text/csv",
        },
      });

      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "weather.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();

      showToast("CSV exportado com sucesso!", "success");
    } catch (err) {
      showToast("Erro ao exportar CSV", "error");
    }
  }

  async function downloadXLSX() {
    try {
      const response = await api.get("/weather/export.xlsx", {
        responseType: "blob",
        headers: {
          Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "weather.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();

      showToast("XLSX exportado com sucesso!", "success");
    } catch (err) {
      showToast("Erro ao exportar XLSX", "error");
    }
  }

  if (loading) return <Loading />;

  const latest = filteredLogs[0];

  // =============================================
  //  NOVO LAYOUT (LÓGICA 100% MANTIDA)
  // =============================================

  return (
    <div className="space-y-8 pb-10">

      {/* TÍTULO + EXPORTAÇÕES */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Dashboard Climático
        </h1>

        <div className="flex gap-2">
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={downloadCSV}>
            CSV
          </Button>
          <Button variant="outline" className="h-8 px-3 text-xs" onClick={downloadXLSX}>
            XLSX
          </Button>
        </div>
      </div>

      {/* ⭐ WEATHER CARD PRINCIPAL (COM TODOS OS DADOS REAIS) */}
      <Card className="rounded-2xl shadow-lg border border-blue-100 bg-blue-50 dark:bg-slate-900 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-xl font-semibold text-blue-700 dark:text-blue-300">
              Clima Atual
            </h2>

            <p className="text-6xl font-bold text-blue-600 dark:text-blue-400 mt-2">
              {latest?.temperature ?? "--"}°C
            </p>

            <p className="text-lg text-slate-700 dark:text-slate-300 mt-1 capitalize">
              {latest?.condition ?? "--"}
            </p>

            <div className="mt-4 space-y-1 text-sm text-slate-700 dark:text-slate-300">
              <p>Umidade: {latest?.humidity ?? "--"}%</p>
              <p>Vento: {latest?.wind_speed ?? "--"} km/h</p>
            </div>
          </div>

          <CloudSun size={110} className="text-blue-400 dark:text-blue-500 opacity-80" />
        </div>
      </Card>

      {/* ⭐ MINI INDICADORES (IGUAL MOCKUP) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <Card className="rounded-xl shadow border bg-white dark:bg-slate-900 dark:border-slate-800">
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Temperatura
            </CardTitle>
            <ThermometerSun className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-blue-600 dark:text-blue-400">
              {latest?.temperature ?? "--"}°C
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow border bg-white dark:bg-slate-900 dark:border-slate-800">
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Umidade
            </CardTitle>
            <Droplets className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-blue-600 dark:text-blue-400">
              {latest?.humidity ?? "--"}%
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow border bg-white dark:bg-slate-900 dark:border-slate-800">
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Vento
            </CardTitle>
            <Wind className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-blue-600 dark:text-blue-400">
              {latest?.wind_speed ?? "--"} km/h
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow border bg-white dark:bg-slate-900 dark:border-slate-800">
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Condição
            </CardTitle>
            <CloudSun className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <p className="text-xl font-semibold text-blue-600 dark:text-blue-400 capitalize">
              {latest?.condition ?? "--"}
            </p>
          </CardContent>
        </Card>

      </div>

      {/* ⭐ INSIGHTS REORGANIZADOS EM 2 COLUNAS */}
      {insights && (
        <Card className="rounded-2xl shadow border bg-white dark:bg-slate-900 dark:border-slate-800 p-6">
          <h2 className="text-xl font-semibold mb-6 text-slate-800 dark:text-slate-200">
            Insights Inteligentes
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

            {/* COLUNA 1 */}
            <div className="space-y-4">

              {insights.resumo && (
                <div className="bg-blue-50 dark:bg-slate-800 p-4 rounded-xl border border-blue-100 dark:border-slate-700">
                  <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-semibold">
                    <Info size={18} />
                    Resumo
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 mt-2">
                    {insights.resumo}
                  </p>
                </div>
              )}

              {insights.tendencias?.length > 0 && (
                <div>
                  <h3 className="uppercase text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    Tendências
                  </h3>
                  <ul className="space-y-2">
                    {insights.tendencias.map((t: string, idx: number) => (
                      <InsightItem
                        key={idx}
                        icon={TrendingUp}
                        text={t}
                        colorClass="text-slate-700 dark:text-slate-300"
                      />
                    ))}
                  </ul>
                </div>
              )}

            </div>

            {/* COLUNA 2 */}
            <div className="space-y-4">

              {insights.alertas?.length > 0 && (
                <div>
                  <h3 className="uppercase text-xs font-semibold text-red-500/90 mb-2">
                    Atenção Necessária
                  </h3>
                  <ul className="space-y-2">
                    {insights.alertas.map((a: string, idx: number) => (
                      <InsightItem
                        key={idx}
                        icon={AlertTriangle}
                        text={a}
                        colorClass="text-red-600 dark:text-red-400 font-medium"
                      />
                    ))}
                  </ul>
                </div>
              )}

              <Button
                onClick={refreshInsights}
                disabled={refreshingInsights}
                className="rounded-xl mt-4 bg-blue-600 hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-600 text-white shadow-md"
              >
                <RefreshCw
                  size={16}
                  className={`mr-2 ${refreshingInsights ? "animate-spin" : ""}`}
                />
                {refreshingInsights ? "Analisando..." : "Atualizar IA"}
              </Button>

            </div>
          </div>
        </Card>
      )}

      {/* ⭐ FILTROS EM CARD REORGANIZADO */}
      <Card className="rounded-2xl shadow border bg-white dark:bg-slate-900 dark:border-slate-800 p-6">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Filtros de Dados</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

            {/* Datas */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Período
              </label>

              <div className="flex gap-2">
                <input
                  type="date"
                  className="w-full rounded-xl border px-2 py-1 text-sm bg-white dark:bg-slate-950 dark:border-slate-700"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />

                <input
                  type="date"
                  className="w-full rounded-xl border px-2 py-1 text-sm bg-white dark:bg-slate-950 dark:border-slate-700"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            {/* Condição */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Condição
              </label>

              <select
                className="w-full rounded-xl border px-2 py-2 text-sm bg-white dark:bg-slate-950 dark:border-slate-700"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
              >
                <option value="all">Todas</option>
                <option value="Clear">Ensolarado</option>
                <option value="Cloudy">Nublado</option>
                <option value="Rain">Chuva</option>
                <option value="Wind">Vento</option>
              </select>
            </div>

            {/* Temp */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Temp. (Min-Máx)
              </label>

              <div className="flex gap-2">
                <input
                  type="number"
                  className="w-full rounded-xl border px-2 py-1 text-sm dark:bg-slate-950 dark:border-slate-700"
                  value={tempMin}
                  onChange={(e) => setTempMin(Number(e.target.value))}
                />

                <input
                  type="number"
                  className="w-full rounded-xl border px-2 py-1 text-sm dark:bg-slate-950 dark:border-slate-700"
                  value={tempMax}
                  onChange={(e) => setTempMax(Number(e.target.value))}
                />
              </div>
            </div>

            {/* Botões */}
            <div className="flex items-end gap-2">
              <Button className="flex-1 rounded-xl" onClick={applyFilters}>
                Aplicar
              </Button>
              <Button variant="outline" className="rounded-xl" onClick={resetFilters}>
                Limpar
              </Button>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* ⭐ GRÁFICO */}
      <Card className="rounded-2xl shadow border bg-white dark:bg-slate-900 dark:border-slate-800 p-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Histórico de Temperatura</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredLogs}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="timestamp" hide />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ⭐ TABELA */}
      <Card className="rounded-2xl shadow border bg-white dark:bg-slate-900 dark:border-slate-800 p-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Registros Detalhados</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-slate-400">
                <tr>
                  <th className="p-3 font-medium text-left">Data</th>
                  <th className="p-3 font-medium text-left">Temp</th>
                  <th className="p-3 font-medium text-left">Umidade</th>
                  <th className="p-3 font-medium text-left">Vento</th>
                  <th className="p-3 font-medium text-left">Condição</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-blue-100 dark:divide-slate-800">
                {filteredLogs.slice(0, 10).map((log: any, idx: number) => (
                  <tr key={idx} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/50">
                    <td className="p-3">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-3">{log.temperature}°C</td>
                    <td className="p-3">{log.humidity}%</td>
                    <td className="p-3">{log.wind_speed} km/h</td>
                    <td className="p-3 capitalize">{log.condition}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length > 10 && (
            <p className="mt-4 text-center text-xs text-slate-400">
              Mostrando os últimos 10 registros de {filteredLogs.length}
            </p>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
