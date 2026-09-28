import { parseAddress, mapsUrl } from "@/lib/supabase";

export default function OrderLocation({ address, mobile }: { address: string | null; mobile?: string | null }) {
  const { text, gps } = parseAddress(address);

  return (
    <div className="space-y-2">
      <p className="text-gray-500">{text || "-"}</p>
      <div className="flex gap-2">
        {gps ? (
          <a
            href={mapsUrl(gps)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center bg-blue-900 text-white font-bold py-2 rounded-xl"
          >
            Map par Rasta Dekho
          </a>
        ) : (
          <p className="flex-1 text-xs text-amber-600 font-semibold self-center">Buyer ne GPS location nahi jodi</p>
        )}
        {mobile && (
          <a href={`tel:${mobile}`} className="px-4 text-center border-2 border-blue-900 text-blue-900 font-bold py-2 rounded-xl">
            Call
          </a>
        )}
      </div>
    </div>
  );
}
