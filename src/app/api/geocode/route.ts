import { NextRequest, NextResponse } from 'next/server';

// Proxy server-side hacia Photon (Komoot) para evitar CORS desde el browser.
// El fetch sale desde el servidor de Next.js, no desde el navegador del usuario.
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q || q.length < 3) return NextResponse.json([]);

  try {
    const url =
      `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5&lang=es&bbox=-78.9,-4.2,-66.8,12.4`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Exploro-App/1.0' },
      next: { revalidate: 0 },
    });

    if (!res.ok) return NextResponse.json([]);

    const data = await res.json();

    const items = (data.features ?? []).map((f: any) => {
      const p = f.properties ?? {};
      const label = [p.name, p.street, p.housenumber].filter(Boolean).join(' ') || p.display_name || '';
      const sublabel = [p.city || p.town || p.village, p.state, p.country].filter(Boolean).join(', ');
      const [lon, lat] = f.geometry?.coordinates ?? [0, 0];
      return { label, sublabel, lat, lon };
    });

    return NextResponse.json(items);
  } catch {
    return NextResponse.json([]);
  }
}
