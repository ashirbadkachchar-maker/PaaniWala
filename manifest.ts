import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'PaaniWala - Ghar Ghar Shuddh Paani',
    short_name: 'PaaniWala',
    description: 'Jodhpur me sabse tez paani delivery - Camper, Tanker, 20L Bottle aur Bisleri 1 click pe',
    start_url: '/home',
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'browser'],
    background_color: '#ffffff',
    theme_color: '#1e3a8a',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
