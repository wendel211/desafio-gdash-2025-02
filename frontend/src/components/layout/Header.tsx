import { LogOut, Moon, Sun } from "lucide-react";
import { getCurrentUser, logout } from "../../store/auth";
import { useTheme } from "../../context/theme";

export function Header() {
  const user = getCurrentUser();
  const { theme, toggleTheme } = useTheme();

  
  const userInitial = user?.email ? user.email[0].toUpperCase() : "U";

  return (
    <header
      className="
        sticky top-0 z-50 w-full
        bg-white/80 dark:bg-gray-900/80
        backdrop-blur-md
        border-b border-gray-200 dark:border-gray-800
        transition-colors duration-300
      "
    >
      <div className="flex items-center justify-between h-16 px-6 mx-auto max-w-7xl">
        

        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 ring-2 ring-white dark:ring-gray-800 shadow-sm">
            <span className="font-bold text-lg">{userInitial}</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
              Bem-vindo
            </span>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-100 max-w-[200px] truncate" title={user?.email}>
              {user?.email ?? "Visitante"}
            </span>
          </div>
        </div>

        {/* Lado Direito: Ações */}
        <div className="flex items-center gap-2">
          
          {/* Botão de Tema */}
          <button
            onClick={toggleTheme}
            aria-label="Alternar tema"
            className="
              p-2.5 rounded-full
              text-gray-500 dark:text-gray-400
              hover:bg-gray-100 dark:hover:bg-gray-800
              hover:text-blue-600 dark:hover:text-blue-400
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-blue-500/20
            "
          >
            {theme === "light" ? (
              <Moon size={20} className="stroke-[1.5]" />
            ) : (
              <Sun size={20} className="stroke-[1.5]" />
            )}
          </button>

          {/* Divisor Vertical */}
          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2 hidden sm:block"></div>

          {/* Botão Logout */}
          <button
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            className="
              flex items-center gap-2 
              px-4 py-2 
              text-sm font-medium 
              text-gray-700 dark:text-gray-200 
              bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20
              hover:text-red-600 dark:hover:text-red-400
              rounded-lg
              transition-all duration-200
              group
            "
          >
            <span className="hidden sm:inline">Sair</span>
            <LogOut size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </header>
  );
}