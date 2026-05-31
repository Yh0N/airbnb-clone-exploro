import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q');
  if (!q || q.length < 3) return NextResponse.json([]);

  // Normalizar formato colombiano: "cra" → "carrera", "cll"/"cl" → "calle"
  const normalizado = q
    .replace(/\bcra\b/gi, 'carrera')
    .replace(/\bcll?\b/gi, 'calle')
    .replace(/\bkra\b/gi, 'carrera')
    .replace(/\bav\b/gi, 'avenida')
    .replace(/#/g, '');

  // Añadir "Colombia" si el usuario no lo escribió
  const query = normalizado.toLowerCase().includes('colombia')
    ? normalizado
    : `${normalizado}, Colombia`;

  try {
    const url = `https://nominatim.openstreetmap.org/search?` +
      `q=${encodeURIComponent(query)}` +
      `&format=json&limit=6&countrycodes=co&addressdetails=1&accept-language=es`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'ExploroApp/1.0 (contacto@exploro.co)',
        'Accept-Language': 'es',
      },
    });

    if (!res.ok) return NextResponse.json([]);

    const data = await res.json();

    const items = data.map((f: any) => {
      const addr = f.address ?? {};
      // Construir label principal: calle + número si existen
      const calle = [addr.road, addr.house_number].filter(Boolean).join(' ');
      const label = calle || f.display_name.split(',')[0];
      // Sublabel: barrio/ciudad, depto
      const sublabel = [
        addr.suburb || addr.neighbourhood,
        addr.city || addr.town || addr.village || addr.municipality,
        addr.state,
      ].filter(Boolean).join(', ');

      return {
        label: label.trim(),
        sublabel: sublabel || 'Colombia',
        lat: parseFloat(f.lat),
        lon: parseFloat(f.lon),
      };
    });

    return NextResponse.json(items);
  } catch (e) {
    console.error('[geocode]', e);
    return NextResponse.json([]);
  }
}
