import { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { 
  Search, 
  X, 
  Flame, 
  Droplets, 
  Leaf, 
  Zap, 
  Mountain, 
  Skull, 
  Snowflake, 
  Wind, 
  Bug, 
  Ghost, 
  Disc, 
  Hexagon, 
  Moon, 
  Star, 
  Dumbbell, 
  Shield, 
  Eye,
  Menu
} from "lucide-react";

// --- CONFIGURAÇÃO DE CORES E ÍCONES ---
const TYPE_CONFIG: Record<string, { color: string; bg: string; icon: any; light: string }> = {
  fire:     { color: "text-red-500", bg: "bg-red-500", light: "bg-red-100 dark:bg-red-900/30", icon: Flame },
  water:    { color: "text-blue-500", bg: "bg-blue-500", light: "bg-blue-100 dark:bg-blue-900/30", icon: Droplets },
  grass:    { color: "text-green-500", bg: "bg-green-500", light: "bg-green-100 dark:bg-green-900/30", icon: Leaf },
  electric: { color: "text-yellow-500", bg: "bg-yellow-500", light: "bg-yellow-100 dark:bg-yellow-900/30", icon: Zap },
  rock:     { color: "text-stone-600", bg: "bg-stone-600", light: "bg-stone-100 dark:bg-stone-900/30", icon: Mountain },
  ground:   { color: "text-amber-600", bg: "bg-amber-600", light: "bg-amber-100 dark:bg-amber-900/30", icon: Mountain },
  psychic:  { color: "text-pink-500", bg: "bg-pink-500", light: "bg-pink-100 dark:bg-pink-900/30", icon: Eye },
  dark:     { color: "text-slate-700", bg: "bg-slate-700", light: "bg-slate-200 dark:bg-slate-800", icon: Moon },
  fairy:    { color: "text-pink-400", bg: "bg-pink-400", light: "bg-pink-100 dark:bg-pink-900/20", icon: Star },
  fighting: { color: "text-orange-700", bg: "bg-orange-700", light: "bg-orange-100 dark:bg-orange-900/30", icon: Dumbbell },
  steel:    { color: "text-slate-400", bg: "bg-slate-400", light: "bg-slate-100 dark:bg-slate-800", icon: Shield },
  ice:      { color: "text-cyan-400", bg: "bg-cyan-400", light: "bg-cyan-100 dark:bg-cyan-900/30", icon: Snowflake },
  bug:      { color: "text-lime-600", bg: "bg-lime-600", light: "bg-lime-100 dark:bg-lime-900/30", icon: Bug },
  ghost:    { color: "text-purple-600", bg: "bg-purple-600", light: "bg-purple-100 dark:bg-purple-900/30", icon: Ghost },
  dragon:   { color: "text-indigo-600", bg: "bg-indigo-600", light: "bg-indigo-100 dark:bg-indigo-900/30", icon: Wind },
  poison:   { color: "text-purple-500", bg: "bg-purple-500", light: "bg-purple-100 dark:bg-purple-900/30", icon: Skull },
  flying:   { color: "text-sky-500", bg: "bg-sky-500", light: "bg-sky-100 dark:bg-sky-900/30", icon: Wind },
  normal:   { color: "text-slate-400", bg: "bg-slate-400", light: "bg-slate-100 dark:bg-slate-800", icon: Disc },
};

export default function Explore() {
  const [pokemons, setPokemons] = useState<any[]>([]);
  const [originalList, setOriginalList] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados de filtro
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("all");
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
        const data = await res.json();
        
        const detailed = await Promise.all(
          data.results.map(async (p: any) => {
            const resp = await fetch(p.url);
            return resp.json();
          })
        );
        
        setPokemons(detailed);
        setOriginalList(detailed);
      } catch (error) {
        console.error("Erro ao carregar pokémons", error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    let list = [...originalList];

    if (search) {
      list = list.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));
    }

    if (activeType !== "all") {
      list = list.filter((p) => p.types.some((t: any) => t.type.name === activeType));
    }

    setPokemons(list);
  }, [search, activeType, originalList]);

  const typesList = ["all", ...Object.keys(TYPE_CONFIG)];

  return (
    <div className="flex flex-col lg:flex-row gap-6 relative">
      
      {/* 📱 HEADER MOBILE */}
      <div className="lg:hidden flex justify-between items-center mb-4 sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-30 py-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pokedex</h1>
        <Button variant="outline" className="h-10 w-10 p-0" onClick={() => setSidebarOpen(!isSidebarOpen)}>
            <Menu />
        </Button>
      </div>

      {/* 🎨 SIDEBAR DE FILTROS COMPACTA */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 transform bg-white p-4 shadow-2xl transition-transform duration-300 ease-in-out dark:bg-slate-900 
        lg:sticky lg:top-4 lg:block lg:w-60 lg:transform-none lg:bg-transparent lg:shadow-none lg:p-0 lg:h-fit
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex flex-col h-full lg:h-auto">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 hidden lg:block">
            Tipos
          </h2>
          
          <div className="grid grid-cols-2 gap-2 content-start">
            {typesList.map((type) => {
              const config = TYPE_CONFIG[type] || { icon: Hexagon, color: "text-slate-500", bg: "bg-slate-500" };
              const Icon = type === "all" ? Hexagon : config.icon;
              const isActive = activeType === type;

              return (
                <button
                  key={type}
                  onClick={() => {
                    setActiveType(type);
                    setSidebarOpen(false);
                  }}
                  className={`
                    group flex flex-col items-center justify-center gap-1 rounded-xl p-2 text-xs font-semibold transition-all border
                    ${isActive 
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20" 
                      : "bg-white border-slate-100 text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
                    }
                  `}
                >
                  <Icon size={16} className={isActive ? "text-white" : config.color} />
                  <span className="capitalize text-[10px]">{type === 'all' ? 'Todos' : type}</span>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* 🎲 ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col">
        
        {/* BARRA DE PESQUISA */}
        <div className="mb-6 relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <input 
                type="text" 
                placeholder="Buscar Pokémon..." 
                className="w-full h-12 pl-12 pr-4 rounded-2xl border-none bg-white shadow-sm text-slate-600 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 dark:bg-slate-900 dark:text-slate-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
        </div>
        
        {/* GRID DE CARDS - Sem scroll interno, usa o scroll da página */}
        <div className="pb-20">
          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="h-64 rounded-3xl bg-slate-200 animate-pulse dark:bg-slate-800" />
                ))}
             </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4 px-2">
                 <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {pokemons.length} encontrados
                 </span>
                 {activeType !== 'all' && (
                     <span className="text-xs font-bold uppercase text-blue-500 bg-blue-50 px-2 py-1 rounded-md dark:bg-blue-900/30">
                        Filtro: {activeType}
                     </span>
                 )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {pokemons.map((p) => {
                  const type = p.types[0].type.name;
                  const config = TYPE_CONFIG[type] || TYPE_CONFIG.normal;
                  const TypeIcon = config.icon;

                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelected(p)}
                      className="group relative cursor-pointer overflow-hidden rounded-[2rem] bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900"
                    >
                      {/* Círculo de Fundo Colorido */}
                      <div className={`absolute -top-8 -left-8 h-36 w-36 rounded-full opacity-10 transition-transform group-hover:scale-110 ${config.bg}`} />
                      
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="mt-2 mb-2 h-28 w-28 transition-transform duration-300 group-hover:scale-110">
                             <img 
                                src={p.sprites.other["official-artwork"].front_default} 
                                alt={p.name}
                                className="h-full w-full object-contain drop-shadow-lg"
                                loading="lazy"
                             />
                        </div>

                        <div className="flex w-full flex-col items-center mt-1">
                           <span className="text-[10px] font-bold text-slate-400 tracking-widest">
                             #{String(p.id).padStart(3, "0")}
                           </span>
                           <h3 className="text-base font-bold capitalize text-slate-800 dark:text-slate-100">
                             {p.name}
                           </h3>
                           
                           <div className={`mt-2 flex items-center gap-1.5 rounded-full px-2.5 py-0.5 ${config.light}`}>
                              <TypeIcon size={10} className={config.color} />
                              <span className={`text-[10px] font-bold uppercase ${config.color}`}>
                                {type}
                              </span>
                           </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>

      {/* 🖼️ MODAL DETALHADO */}
      {selected && (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSelected(null)}
        >
          <div 
            className="relative w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-950 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid md:grid-cols-2">
                <div className={`${TYPE_CONFIG[selected.types[0].type.name]?.bg || 'bg-slate-500'} relative flex flex-col items-center justify-center p-8 text-white min-h-[250px]`}>
                    <button 
                        onClick={() => setSelected(null)}
                        className="absolute top-4 left-4 rounded-full bg-black/10 p-2 text-white hover:bg-black/20 transition-colors md:hidden"
                    >
                        <X size={20} />
                    </button>

                    <h2 className="absolute top-8 text-[100px] font-bold text-white/10 select-none overflow-hidden whitespace-nowrap">
                        {selected.name}
                    </h2>
                    
                    <img 
                        src={selected.sprites.other["official-artwork"].front_default} 
                        className="relative z-10 h-56 w-56 drop-shadow-2xl md:h-72 md:w-72 transition-transform hover:scale-105 duration-500"
                    />
                    
                    <div className="relative z-10 mt-6 flex gap-2">
                        {selected.types.map((t: any) => (
                             <span key={t.type.name} className="rounded-full bg-white/20 px-4 py-1 text-sm font-bold capitalize backdrop-blur-sm border border-white/10 shadow-sm">
                                {t.type.name}
                             </span>
                        ))}
                    </div>
                </div>

                <div className="p-6 md:p-8 bg-white dark:bg-slate-900 max-h-[60vh] md:max-h-[85vh] overflow-y-auto">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <span className="text-xl font-bold text-slate-300">#{String(selected.id).padStart(3, "0")}</span>
                            <h2 className="text-3xl font-bold capitalize text-slate-900 dark:text-white leading-tight">
                                {selected.name}
                            </h2>
                        </div>
                        <Button 
                            variant="outline"
                            onClick={() => setSelected(null)}
                            className="hidden h-9 w-9 items-center justify-center border-0 p-0 md:flex rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                            <X size={20} />
                        </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50 text-center">
                            <p className="text-xs font-bold uppercase text-slate-400 mb-1">Altura</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{selected.height / 10}m</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50 text-center">
                            <p className="text-xs font-bold uppercase text-slate-400 mb-1">Peso</p>
                            <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{selected.weight / 10}kg</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Estatísticas</h3>
                        
                        {selected.stats.map((stat: any) => {
                            const value = stat.base_stat;
                            const percentage = Math.min((value / 150) * 100, 100);
                            let color = "bg-slate-500";
                            
                            if (stat.stat.name === 'hp') color = "bg-red-500";
                            if (stat.stat.name === 'attack') color = "bg-orange-500";
                            if (stat.stat.name === 'defense') color = "bg-yellow-500";
                            if (stat.stat.name === 'speed') color = "bg-blue-500";
                            if (stat.stat.name.includes('special')) color = "bg-purple-500";

                            return (
                                <div key={stat.stat.name} className="flex items-center gap-3">
                                    <span className="w-16 text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                                        {stat.stat.name.replace('special-', 'Sp. ')}
                                    </span>
                                    <div className="flex-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                        <div 
                                            className={`h-full rounded-full ${color}`} 
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="w-8 text-right text-xs font-bold text-slate-700 dark:text-slate-300">
                                        {value}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}