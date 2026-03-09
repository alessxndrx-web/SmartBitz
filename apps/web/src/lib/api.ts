const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export async function getHealth() {
  const res = await fetch(`${API_URL}/api/health`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('No se pudo consultar la API');
  }

  return res.json();
}