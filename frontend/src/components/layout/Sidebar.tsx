import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Compass } from "lucide-react";

export function Sidebar() {
  const menu = [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { label: "Usuários", path: "/users", icon: Users },
    { label: "Explorar API", path: "/explore", icon: Compass },
  ];

  return (
    <aside className="w-60 h-screen bg-[#229CFF] text-white flex flex-col shadow-xl">
      {/* HEADER */}
      <div className="p-6 text-2xl font-semibold tracking-wide">
        GDASH Panel
      </div>

      {/* NAV */}
      <nav className="flex flex-col gap-2 px-4 mt-2">
        {menu.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium 
                transition-all duration-200 cursor-pointer

                ${
                  isActive
                    ? "bg-white text-[#229CFF] shadow-md"
                    : "text-white/90 hover:bg-white/20 hover:text-white"
                }
                `
              }
            >
              <Icon size={20} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
