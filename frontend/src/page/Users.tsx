import { useEffect, useState } from "react";
import { api } from "../api/axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Loading } from "../components/ui/loading";
import { useToast } from "../components/ui/toast";
import { Shield } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
} from "../components/ui/table";

export default function Users() {
  const [users, setUsers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const { showToast } = useToast();

  // 🔒 Email do admin protegido (deve coincidir com o backend)
  const PROTECTED_ADMIN_EMAIL = "admin@gdash.com";

  // MODAIS
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // FILTROS
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [selectedUser, setSelectedUser] = useState<any>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  function handleChange(e: any) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function loadUsers() {
    setInitialLoad(true);
    api
      .get("/users")
      .then((res) => {
        setUsers(res.data);
        setFiltered(res.data);
      })
      .catch(() => showToast("Erro ao carregar usuários", "error"))
      .finally(() => setInitialLoad(false));
  }

  useEffect(() => {
    loadUsers();
  }, []);

  // APLICAR FILTROS
  useEffect(() => {
    let list = [...users];

    if (search) {
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (roleFilter !== "all") {
      list = list.filter((u) => u.role === roleFilter);
    }

    setFiltered(list);
  }, [search, roleFilter, users]);

  // 🔒 Verifica se é o admin protegido
  const isProtectedAdmin = (email: string) => {
    return email === PROTECTED_ADMIN_EMAIL;
  };

  if (initialLoad) return <Loading />;

  // CRIAR USUÁRIO
  async function handleCreate(e: any) {
    e.preventDefault();

    if (!form.name || !form.email || !form.password) {
      showToast("Preencha todos os campos obrigatórios", "error");
      return;
    }

    try {
      setLoading(true);
      await api.post("/users", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      showToast("Usuário criado com sucesso!", "success");
      setIsCreateOpen(false);
      setForm({ name: "", email: "", password: "", role: "user" });
      loadUsers();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Erro ao criar usuário";
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  }

  // EDITAR
  function openEditModal(user: any) {
    // 🔒 PROTEÇÃO: Impede edição do admin
    if (isProtectedAdmin(user.email)) {
      showToast("Não é possível editar o administrador do sistema", "error");
      return;
    }

    setSelectedUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
    });
    setIsEditOpen(true);
  }

  async function handleEdit(e: any) {
    e.preventDefault();

    try {
      setLoading(true);
      const payload: any = {
        name: form.name,
        email: form.email,
        role: form.role,
      };

      if (form.password) {
        payload.password = form.password;
      }

      await api.patch(`/users/${selectedUser._id}`, payload);

      showToast("Usuário atualizado!", "success");
      setIsEditOpen(false);
      setSelectedUser(null);
      setForm({ name: "", email: "", password: "", role: "user" });
      loadUsers();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Erro ao atualizar usuário";
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  }

  // EXCLUIR
  async function deleteUser(id: string, email: string) {
    // 🔒 PROTEÇÃO: Impede exclusão do admin
    if (isProtectedAdmin(email)) {
      showToast("Não é possível excluir o administrador do sistema", "error");
      return;
    }

    if (!confirm("Deseja realmente excluir este usuário?")) return;

    try {
      await api.delete(`/users/${id}`);
      showToast("Usuário excluído!", "success");
      loadUsers();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Erro ao excluir usuário";
      showToast(errorMsg, "error");
    }
  }

  return (
    <div className="space-y-6">
      {/* HEADER & AÇÕES */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-semibold dark:text-white">
          Gerenciamento de Usuários
        </h1>

        <div className="flex gap-3">
          <Input
            placeholder="Buscar por nome ou email..."
            className="w-60 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border p-2 rounded dark:bg-gray-900 dark:border-gray-700 dark:text-white"
          >
            <option value="all">Todos os perfis</option>
            <option value="admin">Administradores</option>
            <option value="user">Usuários comuns</option>
          </select>

          <Button 
            onClick={() => setIsCreateOpen(true)}
            className="shadow-md"
          >
            Novo Usuário
          </Button>
        </div>
      </div>

      {/* TABELA */}
      <div className="rounded-lg border bg-white dark:bg-gray-900 dark:border-gray-700 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50 dark:bg-gray-800">
            <TableRow>
              <TableHead className="dark:text-gray-300">Nome</TableHead>
              <TableHead className="dark:text-gray-300">Email</TableHead>
              <TableHead className="dark:text-gray-300">Perfil</TableHead>
              <TableHead className="dark:text-gray-300">Criado em</TableHead>
              <TableHead className="text-right dark:text-gray-300">Ações</TableHead>
            </TableRow>
          </TableHeader>

          {filtered.map((u) => {
            const isProtected = isProtectedAdmin(u.email);

            return (
              <TableRow
                key={u._id}
                className={`hover:bg-blue-50 dark:hover:bg-blue-900/40 transition-colors dark:text-gray-200 ${
                  isProtected ? "bg-blue-50/50 dark:bg-blue-950/30" : ""
                }`}
              >
                <TableCell className="capitalize">
                  <div className="flex items-center gap-2">
                    {isProtected && (
                      <Shield size={16} className="text-blue-600 dark:text-blue-400" />
                    )}
                    {u.name}
                  </div>
                </TableCell>
                
                <TableCell>{u.email}</TableCell>

                <TableCell>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      u.role === "admin"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                        : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {u.role}
                    {isProtected && " (Sistema)"}
                  </span>
                </TableCell>

                <TableCell>{new Date(u.createdAt).toLocaleString()}</TableCell>

                <TableCell className="flex justify-end gap-2">
                  {/* 🔒 Botões desabilitados para admin protegido */}
                  <Button
                    variant="outline"
                    onClick={() => openEditModal(u)}
                    disabled={isProtected}
                    className={`
                      ${isProtected 
                        ? "opacity-50 cursor-not-allowed" 
                        : "hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
                      }
                    `}
                    title={isProtected ? "Usuário do sistema não pode ser editado" : "Editar usuário"}
                  >
                    Editar
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => deleteUser(u._id, u.email)}
                    disabled={isProtected}
                    className={`
                      ${isProtected
                        ? "opacity-50 cursor-not-allowed"
                        : "border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                      }
                    `}
                    title={isProtected ? "Usuário do sistema não pode ser excluído" : "Excluir usuário"}
                  >
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </Table>

        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Nenhum usuário encontrado
          </div>
        )}
      </div>

      {/* MODAL DE CRIAÇÃO */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md dark:bg-gray-900 dark:text-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle>
              <span className="text-xl">Criar Novo Usuário</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium mb-1 block dark:text-gray-300">
                Nome Completo *
              </label>
              <Input
                name="name"
                placeholder="Ex: João Silva"
                value={form.name}
                onChange={handleChange}
                required
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block dark:text-gray-300">
                Email *
              </label>
              <Input
                name="email"
                type="email"
                placeholder="exemplo@email.com"
                value={form.email}
                onChange={handleChange}
                required
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block dark:text-gray-300">
                Senha *
              </label>
              <Input
                name="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block dark:text-gray-300">
                Perfil
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="border p-2 rounded w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="user">Usuário Comum</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <DialogFooter>
              <Button 
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateOpen(false);
                  setForm({ name: "", email: "", password: "", role: "user" });
                }}
                className="mr-2"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Criando..." : "Criar Usuário"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* MODAL DE EDIÇÃO */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md dark:bg-gray-900 dark:text-gray-200 shadow-lg">
          <DialogHeader>
            <DialogTitle>
              <span className="text-xl">Editar Usuário</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEdit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block dark:text-gray-300">
                Nome Completo
              </label>
              <Input
                name="name"
                placeholder="Nome"
                value={form.name}
                onChange={handleChange}
                required
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block dark:text-gray-300">
                Email
              </label>
              <Input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block dark:text-gray-300">
                Nova Senha (deixe em branco para manter)
              </label>
              <Input
                name="password"
                type="password"
                placeholder="Nova senha (opcional)"
                value={form.password}
                onChange={handleChange}
                className="dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block dark:text-gray-300">
                Perfil
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="border p-2 rounded w-full dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="user">Usuário Comum</option>
                <option value="admin">Administrador</option>
              </select>
            </div>

            <DialogFooter>
              <Button 
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditOpen(false);
                  setSelectedUser(null);
                  setForm({ name: "", email: "", password: "", role: "user" });
                }}
                className="mr-2"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}