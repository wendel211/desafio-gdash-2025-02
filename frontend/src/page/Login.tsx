import { useState } from "react";
import { api } from "../api/axios";
import { Input } from "../components/ui/input";
import { useTheme } from "../context/theme";
import { Moon, Sun } from "lucide-react";

// 🔥 IMPORTAÇÃO DA IMAGEM
import adaImage from "../assets/ada.jpg";

export default function Login() {
  const [email, setEmail] = useState("admin@gdash.com");
  const [password, setPassword] = useState("123456");
  const { theme, toggleTheme } = useTheme();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", res.data.access_token);
    window.location.href = "/";
  }

  return (
    <div
      className="
      h-screen w-screen flex items-center justify-center 
      bg-[#E9F3FF] 
      dark:bg-gray-900
      relative overflow-hidden
      "
    >


      <button
        onClick={toggleTheme}
        className="absolute top-5 right-5 p-2 rounded-full bg-white dark:bg-gray-800 shadow hover:scale-105 transition"
      >
        {theme === "light" ? <Moon size={20} /> : <Sun size={20} className="text-yellow-400" />}
      </button>


      <div className="w-[900px] h-[520px] bg-white dark:bg-gray-800 rounded-xl shadow-xl grid grid-cols-2 overflow-hidden">


        <div className="relative flex flex-col justify-center px-14">

          <div className="absolute w-40 h-40 bg-[#2563EB] rounded-full -left-16 top-10 opacity-20"></div>
          <div className="absolute w-20 h-20 bg-[#3B82F6] rounded-full right-10 top-0 opacity-30"></div>

          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
            Dashboard <br /> GDASH
          </h1>

          <form onSubmit={handleLogin} className="space-y-5">

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Email
              </label>
              <Input
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1 text-gray-700 dark:text-gray-300">
                Senha
              </label>
              <Input
                placeholder="Digite sua senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-gray-300 rounded-md dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />

            </div>

            <button
              type="submit"
              className="
                mt-2 w-full h-11 rounded-lg flex items-center justify-center 
                font-semibold tracking-wide bg-[#2563EB] text-white 
                hover:bg-[#1E4FCF] transition relative
              "
            >
              LOGIN
              <span className="absolute right-0 h-full w-12 bg-[#1E3A8A] flex items-center justify-center rounded-r-lg">
                →
              </span>
            </button>
          </form>
        </div>


        <div
          className="
            bg-cover 
            bg-center 
            bg-no-repeat
          "
          style={{ backgroundImage: `url(${adaImage})` }}
        ></div>

      </div>
    </div>
  );
}
