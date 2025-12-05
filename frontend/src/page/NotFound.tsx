import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center space-y-6">

      <h1 className="text-6xl font-bold text-gray-800">404</h1>
      <p className="text-gray-600 text-lg max-w-md">
        A página que você está tentando acessar não existe ou foi movida.
      </p>

      <Button onClick={() => navigate("/")}>
        Voltar ao Dashboard
      </Button>
    </div>
  );
}
