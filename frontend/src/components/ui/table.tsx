export function Table({ children }: any) {
  return <table className="w-full text-sm">{children}</table>;
}

export function TableHeader({ children }: any) {
  return <thead className="border-b">{children}</thead>;
}

export function TableRow({ children }: any) {
  return <tr className="border-b hover:bg-gray-50">{children}</tr>;
}

export function TableCell({ children }: any) {
  return <td className="p-2">{children}</td>;
}

export function TableHead({ children }: any) {
  return <th className="p-2 text-left font-medium">{children}</th>;
}
export function TableBody({ children }: any) {
  return <tbody>{children}</tbody>;
}
