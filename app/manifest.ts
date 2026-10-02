import type { MetadataRoute } from 'next'
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PaaniWala - Ghar Ghar Shuddh Paani',
    short_name: 'PaaniWala',
    description: 'Jodhpur me sabse tez paani delivery - Camper, Tanker, 20L Bottle',
    start_url: '/home',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1e3a8a',
    icons: [
      { src: '/icon-192.jpg', sizes: '192x192', type: 'image/jpeg' },
      { src: '/icon-512.jpg', sizes: '512x512', type: 'image/jpeg' },
    ],
  }
}
