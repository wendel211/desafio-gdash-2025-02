import { LogOut, Moon, Sun } from "lucide-react";
import { getCurrentUser, logout } from "../../store/auth";
import { useTheme } from "../../context/theme";

export function Header() {
  const user = getCurrentUser();
  const { theme, toggleTheme } = useTheme();

  return (
    <header
      className="
        h-16 
        bg-white 
        dark:bg-gray-900 
        border-b border-blue-100 
        dark:border-gray-700
        shadow-sm
        flex items-center justify-between 
        px-8
      "
    >
      {/* Bem-vindo */}
      <h1 className="text-xl font-semibold text-slate-800 dark:text-gray-100 tracking-tight">
        Bem-vindo, <span className="font-bold">{user?.email ?? "Usuário"}</span>
      </h1>

      {/* Botões à direita */}
      <div className="flex items-center gap-4">

        {/* Botão de tema */}
        <button
          onClick={toggleTheme}
          className="
            p-2 
            rounded-xl 
            bg-gray-100 
            dark:bg-gray-800 
            hover:bg-gray-200 
            dark:hover:bg-gray-700 
            transition
            shadow-sm
          "
        >
          {theme === "light" ? (
            <Moon size={20} className="text-slate-700" />
          ) : (
            <Sun size={20} className="text-yellow-400" />
          )}
        </button>

        {/* Logout */}
        <button
          onClick={() => {
            logout();
            window.location.href = "/login";
          }}
          className="
            flex items-center gap-2 
            text-slate-600 
            dark:text-gray-200 
            hover:text-red-600 
            dark:hover:text-red-400 
            font-medium
            transition
          "
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </header>
  );
}
