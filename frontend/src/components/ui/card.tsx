export function Card({ children, className = "" }: any) {
  return <div className={`rounded-lg border bg-white shadow-sm ${className}`}>{children}</div>;
}

export function CardHeader({ children }: any) {
  return <div className="p-4 border-b">{children}</div>;
}

export function CardTitle({ children }: any) {
  return <h3 className="text-lg font-semibold">{children}</h3>;
}

export function CardContent({ children }: any) {
  return <div className="p-4">{children}</div>;
}

export function CardFooter({ children }: any) {
  return <div className="p-4 border-t">{children}</div>;
}

export function CardDescription({ children }: any) {
  return <p className="text-sm text-gray-500">{children}</p>;
}
