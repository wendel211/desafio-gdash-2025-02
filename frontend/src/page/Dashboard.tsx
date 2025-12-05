import { useEffect, useState, useMemo } from "react";
import { api } from "../api/axios";
import { Loading } from "../components/ui/loading";
import { useToast } from "../components/ui/toast";
import {

  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Download,
  TrendingUp,
  Activity,
  Droplets,
  Wind,
  Filter,
  RefreshCw,
  Info,
  AlertTriangle,
  ThermometerSun,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";

import { Button } from "../components/ui/button";



const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const InsightItem = ({ icon: Icon, text, colorClass }: any) => (
  <li className={`flex items-start gap-2 text-sm ${colorClass}`}>
    <Icon className="mt-0.5 h-4 w-4 shrink-0 opacity-70" />
    <span>{text}</span>
  </li>
);

function KpiCard({ title, value, icon: Icon, trend, color }: any) {
  return (
    <Card className="border shadow-sm overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{title}</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{value}</h3>
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon size={22} />
          </div>
        </div>
        <p className="mt-4 text-xs text-slate-400 flex items-center gap-1">
          <TrendingUp size={12} className="text-emerald-500" /> {trend}
        </p>
      </CardContent>
    </Card>
  );
}

export default function AnalyticsDashboard() {

  const [logs, setLogs] = useState<any[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingInsights, setRefreshingInsights] = useState(false);
  const { showToast } = useToast();

  // === ESTADOS DE FILTRO ===
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [condition, setCondition] = useState("all");
  const [tempMin, setTempMin] = useState(0);
  const [tempMax, setTempMax] = useState(60);
  const [showFilters, setShowFilters] = useState(false);

  // === CARREGAMENTO INICIAL ===
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        // Chamadas reais para sua API
        const logsRes = await api.get("/weather/logs");
        const insightsRes = await api.get("/weather/insights");

        setLogs(logsRes.data);
        setFilteredLogs(logsRes.data);
        setInsights(insightsRes.data);
      } catch (err) {
        showToast("Erro ao carregar dados do dashboard", "error");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [showToast]);

  // === AÇÕES ===
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
        headers: { Accept: "text/csv" },
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
        headers: { Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
      });
      const blob = new Blob([response.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
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

  const processedData = useMemo(() => {
    if (!filteredLogs.length) return { timeline: [], conditions: [], stats: {} };


    const temps = filteredLogs.map(l => l.temperature);
    const maxTemp = Math.max(...temps).toFixed(1);
    const minTemp = Math.min(...temps).toFixed(1);
    const avgTemp = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
    
    const hums = filteredLogs.map(l => l.humidity);
    const avgHum = (hums.reduce((a, b) => a + b, 0) / hums.length).toFixed(0);

    const winds = filteredLogs.map(l => l.wind_speed);
    const maxWind = Math.max(...winds).toFixed(1);

    // 2. Distribuição de Condições
    const conditionCounts: Record<string, number> = {};
    filteredLogs.forEach(l => {
        const cond = l.condition || "Desconhecido";
        conditionCounts[cond] = (conditionCounts[cond] || 0) + 1;
    });
    const conditionData = Object.keys(conditionCounts).map(key => ({
        name: key,
        value: conditionCounts[key]
    }));

    // 3. Timeline
    // Reverter array se vier do mais novo para o mais antigo, para o gráfico ler da esquerda p/ direita
    // Verifique se sua API retorna ASC ou DESC e ajuste o .reverse() se necessário
    const timelineData = [...filteredLogs].reverse().map(log => ({
        timestamp: log.timestamp,
        time: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        fullDate: new Date(log.timestamp).toLocaleDateString(),
        temperature: log.temperature,
        humidity: log.humidity,
        wind: log.wind_speed,
        condition: log.condition 
    }));

    return {
        stats: { maxTemp, minTemp, avgTemp, avgHum, maxWind },
        conditions: conditionData,
        timeline: timelineData
    };
  }, [filteredLogs]);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 p-4 md:p-6 space-y-6">
      
      {/* HEADER + BOTÕES */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Activity className="text-blue-600" /> Dashboard Climático
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Análise de dados em tempo real
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
           <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
             <Filter className="mr-2 h-4 w-4" /> Filtros
           </Button>
           <Button variant="outline" size="sm" onClick={downloadCSV}>
             <Download className="mr-2 h-4 w-4" /> CSV
           </Button>
           <Button variant="default" size="sm" onClick={downloadXLSX}>
             <Download className="mr-2 h-4 w-4" /> XLSX
           </Button>
        </div>
      </div>

      {/* ÁREA DE FILTROS (COLLAPSIBLE) */}
      {(showFilters || window.innerWidth > 768) && (
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Início</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full text-sm p-2 border rounded-md dark:bg-slate-950 dark:border-slate-700" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Fim</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full text-sm p-2 border rounded-md dark:bg-slate-950 dark:border-slate-700" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Condição</label>
                        <select value={condition} onChange={e => setCondition(e.target.value)} className="w-full text-sm p-2 border rounded-md dark:bg-slate-950 dark:border-slate-700">
                            <option value="all">Todas</option>
                            <option value="Clear">Ensolarado</option>
                            <option value="Cloudy">Nublado</option>
                            <option value="Rain">Chuva</option>
                            <option value="Wind">Vento</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase">Temp Min/Max</label>
                        <div className="flex gap-2">
                            <input type="number" placeholder="0" value={tempMin} onChange={e => setTempMin(Number(e.target.value))} className="w-full text-sm p-2 border rounded-md dark:bg-slate-950 dark:border-slate-700" />
                            <input type="number" placeholder="60" value={tempMax} onChange={e => setTempMax(Number(e.target.value))} className="w-full text-sm p-2 border rounded-md dark:bg-slate-950 dark:border-slate-700" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button onClick={applyFilters} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">Aplicar</Button>
                        <Button onClick={resetFilters} variant="outline" className="px-3"><RefreshCw size={14}/></Button>
                    </div>
                </div>
            </CardContent>
        </Card>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
            title="Temp. Média" 
            value={`${processedData.stats.avgTemp || 0}°C`} 
            icon={ThermometerSun} 
            trend="Período selecionado"
            color="text-blue-600 bg-blue-50 dark:bg-blue-900/20"
        />
        <KpiCard 
            title="Pico Máximo" 
            value={`${processedData.stats.maxTemp || 0}°C`} 
            icon={TrendingUp} 
            trend="Máxima registrada"
            color="text-red-600 bg-red-50 dark:bg-red-900/20"
        />
        <KpiCard 
            title="Umidade Média" 
            value={`${processedData.stats.avgHum || 0}%`} 
            icon={Droplets} 
            trend="Média do período"
            color="text-cyan-600 bg-cyan-50 dark:bg-cyan-900/20"
        />
        <KpiCard 
            title="Vento Máximo" 
            value={`${processedData.stats.maxWind || 0} km/h`} 
            icon={Wind} 
            trend="Rajada mais forte"
            color="text-slate-600 bg-slate-50 dark:bg-slate-800"
        />
      </div>

      {/* LINHA DE GRÁFICOS 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRÁFICO TEMPORAL */}
        <Card className="lg:col-span-2 shadow-sm">
            <CardHeader>
                <CardTitle>Análise Temporal</CardTitle>
                <CardDescription>
                  Cruzamento de Temperatura (Linha) e Umidade (Barra)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={processedData.timeline} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                            <defs>
                                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.4} />
                            <XAxis 
                                dataKey="time" 
                                tickLine={false} 
                                axisLine={false} 
                                tick={{fontSize: 11, fill: '#64748b'}} 
                                minTickGap={30}
                            />
                            <YAxis 
                                yAxisId="left" 
                                orientation="left" 
                                stroke="#2563eb" 
                                tickLine={false} 
                                axisLine={false}
                                unit="°C"
                                width={40}
                            />
                            <YAxis 
                                yAxisId="right" 
                                orientation="right" 
                                stroke="#00C49F" 
                                tickLine={false} 
                                axisLine={false}
                                unit="%"
                                width={40}
                            />
                            <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                labelStyle={{ color: '#64748b', marginBottom: '4px' }}
                            />
                            <Legend verticalAlign="top" height={36}/>
                            <Bar yAxisId="right" dataKey="humidity" name="Umidade (%)" fill="#00C49F" opacity={0.3} radius={[4, 4, 0, 0]} barSize={20} />
                            <Area yAxisId="left" type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#2563eb" fillOpacity={1} fill="url(#colorTemp)" strokeWidth={2} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>

        {/* INSIGHTS CARD */}
        <Card className="shadow-sm flex flex-col">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                        <Info size={18} className="text-purple-500" />
                        Insights AI
                    </CardTitle>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={refreshInsights} 
                        disabled={refreshingInsights}
                        className={refreshingInsights ? "animate-spin text-purple-600" : "text-slate-400 hover:text-purple-600"}
                    >
                        <RefreshCw size={16} />
                    </Button>
                </div>
                <CardDescription>Análise inteligente dos dados</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto max-h-[350px] space-y-4">
                {insights ? (
                    <>
                        <div className="bg-purple-50 dark:bg-purple-900/10 p-3 rounded-lg border border-purple-100 dark:border-purple-900/20">
                            <p className="text-sm text-slate-700 dark:text-slate-300 italic">
                                "{insights.resumo}"
                            </p>
                        </div>
                        
                        {insights.tendencias?.length > 0 && (
                            <div>
                                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                                    <TrendingUp size={12}/> Tendências
                                </h4>
                                <ul className="space-y-2">
                                    {insights.tendencias.map((t: string, idx: number) => (
                                        <InsightItem key={idx} icon={TrendingUp} text={t} colorClass="text-slate-600 dark:text-slate-400" />
                                    ))}
                                </ul>
                            </div>
                        )}

                        {insights.alertas?.length > 0 && (
                            <div>
                                <h4 className="text-xs font-bold text-red-500 uppercase mb-2 flex items-center gap-1">
                                    <AlertTriangle size={12}/> Alertas
                                </h4>
                                <ul className="space-y-2">
                                    {insights.alertas.map((a: string, idx: number) => (
                                        <InsightItem key={idx} icon={AlertTriangle} text={a} colorClass="text-red-600 dark:text-red-400 font-medium" />
                                    ))}
                                </ul>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <Info size={32} className="mb-2 opacity-20"/>
                        <p className="text-xs">Nenhum insight disponível</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>

      {/* LINHA DE GRÁFICOS 2 (PIZZA + TABELA) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           
           {/* GRÁFICO PIZZA */}
           <Card>
                <CardHeader>
                    <CardTitle>Condições</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={processedData.conditions}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {processedData.conditions.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend layout="vertical" verticalAlign="middle" align="right" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
           </Card>

           {/* TABELA DE REGISTROS */}
           <Card className="md:col-span-2">
                <CardHeader>
                    <CardTitle>Últimos Registros</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500">
                                <tr>
                                    <th className="p-3 text-left font-medium">Horário</th>
                                    <th className="p-3 text-left font-medium">Temp</th>
                                    <th className="p-3 text-left font-medium">Umid</th>
                                    <th className="p-3 text-left font-medium">Vento</th>
                                    <th className="p-3 text-left font-medium">Condição</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {filteredLogs.slice(0, 5).map((log: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                        <td className="p-3 text-slate-600 dark:text-slate-300">
                                            {new Date(log.timestamp).toLocaleTimeString()} <span className="text-xs text-slate-400">{new Date(log.timestamp).toLocaleDateString()}</span>
                                        </td>
                                        <td className="p-3 font-medium">{log.temperature}°C</td>
                                        <td className="p-3">{log.humidity}%</td>
                                        <td className="p-3">{log.wind_speed} km/h</td>
                                        <td className="p-3">
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 capitalize">
                                                {log.condition}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredLogs.length > 5 && (
                        <div className="mt-4 text-center">
                            <Button variant="ghost" size="sm" className="text-xs text-slate-500">
                                Ver todos os {filteredLogs.length} registros
                            </Button>
                        </div>
                    )}
                </CardContent>
           </Card>
      </div>
    </div>
  );
}