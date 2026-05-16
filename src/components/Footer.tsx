'use client';

// ===== FOOTER - ESTILO AIRBNB 2025 =====
// Footer multi-columna con inspiración de viajes y barra fija inferior

import React, { useState } from 'react';
import Link from 'next/link';
import { Globe, ChevronUp, ChevronDown } from 'lucide-react';

const inspirationTabs = [
  { id: 'popular', label: 'Populares' },
  { id: 'naturaleza', label: 'Naturaleza' },
  { id: 'cultura', label: 'Cultura' },
  { id: 'aventura', label: 'Aventura' },
  { id: 'gastronomia', label: 'Gastronomía' },
];

const inspirationData: Record<string, { name: string; desc: string }[]> = {
  popular: [
    { name: 'Laguna de la Cocha', desc: 'Paseos en lancha' },
    { name: 'Santuario de Las Lajas', desc: 'Arquitectura neogótica' },
    { name: 'Volcán Galeras', desc: 'Trekking de alta montaña' },
    { name: 'Centro Histórico', desc: 'Cultura colonial' },
    { name: 'Carnaval de Negros y Blancos', desc: 'Patrimonio UNESCO' },
    { name: 'Laguna Verde', desc: 'Volcán Azufral' },
  ],
  naturaleza: [
    { name: 'Laguna de la Cocha', desc: 'El Encano' },
    { name: 'Laguna Verde', desc: 'Túquerres' },
    { name: 'Reserva Río Ñambí', desc: 'Barbacoas' },
    { name: 'Páramo de Cumbal', desc: 'Cumbal' },
    { name: 'Volcán Galeras', desc: 'Santuario de Flora y Fauna' },
    { name: 'Termas de Tajumbina', desc: 'La Cruz' },
  ],
  cultura: [
    { name: 'Carnaval de Negros y Blancos', desc: 'Patrimonio UNESCO' },
    { name: 'Centro Histórico', desc: 'Arquitectura colonial' },
    { name: 'Barniz de Pasto', desc: 'Artesanía Mopa-Mopa' },
    { name: 'Iglesia San Juan Bautista', desc: 'Arte colonial' },
    { name: 'Museo del Carnaval', desc: 'Tradiciones nariñenses' },
    { name: 'Plaza de Nariño', desc: 'Corazón de la ciudad' },
  ],
  aventura: [
    { name: 'Volcán Galeras', desc: 'Trekking' },
    { name: 'Laguna Verde', desc: 'Alta montaña' },
    { name: 'Páramo de Cumbal', desc: 'Frailejones y volcanes' },
    { name: 'Reserva Río Ñambí', desc: 'Senderismo ecológico' },
    { name: 'Laguna de la Cocha', desc: 'Paseos en lancha' },
    { name: 'Isla de La Corota', desc: 'Biodiversidad única' },
  ],
  gastronomia: [
    { name: 'Mercado de Bombonera', desc: 'Cuy asado y fritada' },
    { name: 'Helados de paila', desc: 'Tradición nariñense' },
    { name: 'Empanadas de añejo', desc: 'Sabor ancestral' },
    { name: 'Frito pastuso', desc: 'Plato típico' },
    { name: 'Mote nariñense', desc: 'Receta tradicional' },
    { name: 'Trucha de la Cocha', desc: 'Pesca artesanal' },
  ],
};

export default function Footer() {
  const [activeInspirationTab, setActiveInspirationTab] = useState('popular');
  const [showInspiration, setShowInspiration] = useState(true);

  return (
    <footer className="bg-neutral-100 dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 mt-12 transition-colors duration-300">
      {/* Sección de inspiración */}
      <div className="max-w-[2520px] mx-auto px-4 sm:px-6 md:px-10 xl:px-20">
        <div className="py-10 border-b border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => setShowInspiration(!showInspiration)}
            className="flex items-center justify-between w-full mb-6"
          >
            <h3 className="text-[20px] md:text-[22px] font-bold text-neutral-800 dark:text-white">
              Inspiración para viajes a Nariño
            </h3>
            {showInspiration ? (
              <ChevronUp className="w-5 h-5 text-neutral-600 dark:text-neutral-400 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-5 h-5 text-neutral-600 dark:text-neutral-400 flex-shrink-0" />
            )}
          </button>

          {showInspiration && (
            <>
              {/* Tabs de inspiración */}
              <div className="flex gap-4 sm:gap-6 border-b border-neutral-200 dark:border-neutral-800 mb-6 overflow-x-auto scrollbar-hide">
                {inspirationTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveInspirationTab(tab.id)}
                    className={`pb-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                      activeInspirationTab === tab.id
                        ? 'border-neutral-800 dark:border-white text-neutral-800 dark:text-white'
                        : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:border-neutral-300 dark:hover:border-neutral-600'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Grid de destinos */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {inspirationData[activeInspirationTab]?.map((item, idx) => (
                  <Link key={idx} href="/" className="group">
                    <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 group-hover:underline">
                      {item.name}
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{item.desc}</p>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Columnas principales */}
      <div className="max-w-[2520px] mx-auto px-4 sm:px-6 md:px-10 xl:px-20 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Columna 1 */}
          <div>
            <h4 className="font-bold text-sm text-neutral-800 dark:text-white mb-4">Asistencia</h4>
            <ul className="space-y-3">
              <li>
                <span className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:underline transition-colors cursor-pointer">
                  Centro de ayuda
                </span>
              </li>
              <li>
                <span className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:underline transition-colors cursor-pointer">
                  AirCover
                </span>
              </li>
              <li>
                <span className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:underline transition-colors cursor-pointer">
                  Información de seguridad
                </span>
              </li>
              <li>
                <span className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:underline transition-colors cursor-pointer">
                  Opciones de cancelación
                </span>
              </li>
              <li>
                <span className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:underline transition-colors cursor-pointer">
                  Reportar un problema
                </span>
              </li>
            </ul>
          </div>

          {/* Columna 2 */}
          <div>
            <h4 className="font-bold text-sm text-neutral-800 dark:text-white mb-4">Comunidad</h4>
            <ul className="space-y-3">
              <li>
                <span className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:underline transition-colors cursor-pointer">
                  Exploro.org: ayuda en desastres
                </span>
              </li>
              <li>
                <span className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:underline transition-colors cursor-pointer">
                  Combatir la discriminación
                </span>
              </li>
            </ul>
          </div>

          {/* Columna 3 */}
          <div>
            <h4 className="font-bold text-sm text-neutral-800 dark:text-white mb-4">Acerca de</h4>
            <ul className="space-y-3">
              <li>
                <span className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:underline transition-colors cursor-pointer">
                  Sala de prensa
                </span>
              </li>
              <li>
                <span className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:underline transition-colors cursor-pointer">
                  Nuevas funciones
                </span>
              </li>
              <li>
                <span className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:underline transition-colors cursor-pointer">
                  Empleo
                </span>
              </li>
              <li>
                <span className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-white hover:underline transition-colors cursor-pointer">
                  Inversionistas
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Barra inferior fija estilo Airbnb */}
      <div className="border-t border-neutral-200 dark:border-neutral-800">
        <div className="max-w-[2520px] mx-auto px-4 sm:px-6 md:px-10 xl:px-20 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap text-sm text-neutral-600 dark:text-neutral-400">
              <span>© 2026 Exploro, Inc.</span>
              <span>·</span>
              <span className="hover:underline cursor-pointer">Privacidad</span>
              <span>·</span>
              <span className="hover:underline cursor-pointer">Términos</span>
              <span>·</span>
              <span className="hover:underline cursor-pointer">Mapa del sitio</span>
              <span>·</span>
              <span className="hover:underline cursor-pointer">Información de la empresa</span>
            </div>
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 text-sm font-semibold text-neutral-800 dark:text-neutral-200 hover:underline">
                <Globe className="w-4 h-4" />
                Español (CO)
              </button>
              <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">$ COP</span>
              {/* Social icons */}
              <div className="flex items-center gap-4">
                <a href="#" className="text-neutral-700 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="text-neutral-700 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
                <a href="#" className="text-neutral-700 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                  <svg className="w-[18px] h-[18px]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
