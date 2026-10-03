"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";
import { supabase, getMobile, makeOrderId } from "@/lib/supabase";

const times = ["Aaj Subah 8 Baje", "Aaj Shaam 5 Baje", "Kal Subah 8 Baje"];

export default function Checkout({ params }: { params: { pid: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [qty, setQty] = useState(1);
  const [time, setTime] = useState(times[1]);
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);

  // FIXED: Permanent address profile se - kabhi overwrite nahi hoga
  const [permanentAddress, setPermanentAddress] = useState("");
  const [profileName, setProfileName] = useState("");

  // NAYA: Har order pe fresh current GPS
  const [currLoc, setCurrLoc] = useState<{lat:number,lng:number}|null>(null);
  const [locMsg, setLocMsg] = useState("Current location le raha hoon...");
  const [locLoading, setLocLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: p } = await supabase.from("products").select("*").eq("id", params.pid).single();
      if (p) {
        setProduct(p);
        const { data: s } = await supabase.from("sellers").select("*").eq("id", p.seller_id).single();
        if (s) setSeller(s);
      }
      const mobile = getMobile();
      if(mobile){
        // Permanent address + name profile se fixed
        const {data: prof} = await supabase.from("profiles").select("name,address").eq("mobile", mobile).maybeSingle();
        if(prof?.address) {
          // Agar purane orders ne GPS joda hua hai to sirf permanent part lo
          const perm = prof.address.split("|")[0].replace("PERMANENT:","").replace("GPS:","").trim();
          setPermanentAddress(perm || prof.address);
        }
        if(prof?.name) setProfileName(prof.name);
      }
    })();
    getCurrentLocation();
  }, [params.pid]);

  const getCurrentLocation = () => {
    setLocLoading(true);
    setLocMsg("Current location le raha hoon...");
    if (!("geolocation" in navigator)) {
      setLocMsg("GPS support nahi hai");
      setLocLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocMsg(`Current GPS mil gaya! ${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        setLocLoading(false);
      },
      () => {
        setLocMsg("Location allow karo - sahi delivery ke liye zaruri hai");
        setLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const ensureCustomerPassword = async (mobile: string) => {
    const { data: existing } = await supabase.from("profiles").select("id,password").eq("mobile", mobile).maybeSingle();
    if (!existing) {
      const pw = String(Math.floor(1000 + Math.random() * 9000));
      await supabase.from("profiles").insert({
        mobile,
        password: pw,
        name: profileName || "Customer",
        address: permanentAddress || "Jodhpur" // Fixed permanent
      });
      return pw;
    }
    if (!existing.password) {
      const pw = String(Math.floor(1000 + Math.random() * 9000));
      await supabase.from("profiles").update({ password: pw }).eq("id", existing.id);
      return pw;
    }
    return null;
  };

  const placeOrder = async () => {
    const mobile = getMobile();
    if (!mobile) { router.push("/login?next="+encodeURIComponent("/order/"+params.pid)); return; }
    if (!currLoc) { getCurrentLocation(); alert("Pehle current location lena zaruri hai"); return; }

    setSaving(true);
    const generatedPw = await ensureCustomerPassword(mobile);
    const orderId = makeOrderId();
    const deliveryOtp = String(Math.floor(1000 + Math.random() * 9000));

    // FIXED LOGIC: Seller ko jayega = Permanent Address + Current GPS + Mobile
    const finalAddress = `PERMANENT: ${permanentAddress || "N/A"} | CURRENT GPS: ${currLoc.lat},${currLoc.lng} | TIME: ${new Date().toLocaleString("en-IN")}`;

    let payload: any = {
      order_id: orderId,
      mobile, // Seller ko mobile chala jayega
      seller_id: product.seller_id,
      item_type: product.item_type,
      item_name: (product.item_type === "tanker"? "" : q + " x ") + product.item_name,
      qty: q,
      price,
      total: price,
      commission,
      seller_earning: price - commission,
      delivery_slot: time,
      address: finalAddress, // Permanent + Current dono
      delivery_otp: deliveryOtp,
      status: "Naya",
      lat: currLoc.lat, // Current GPS - delivery yahi hoga
      lng: currLoc.lng,
    };

    let { error } = await supabase.from("orders").insert(payload);
    if (error && error.message.includes("column")) {
      // Agar lat/lng column nahi hai to fallback
      const { lat, lng,...rest } = payload;
      const { error: err2 } = await supabase.from("orders").insert(rest);
      error = err2;
    }

    // IMPORTANT: Profile ka permanent address FIXED rahega - overwrite nahi karna
    // Sirf last GPS alag se save kar sakte ho agar chaho, address nahi
    // if (!error) { /* profile update mat karo address ka */ }

    localStorage.setItem("pw_last_order", orderId);
    setSaving(false);
    if (error) { alert("Order fail: "+error.message); return; }
    if (generatedPw) setNewPassword(generatedPw); else router.push("/success");
  };

  if (newPassword) return <><Header /><main className="flex-1 p-6 text-center space-y-4"><div className="w-20 h-20 rounded-full gold-btn flex items-center justify-center text-4xl text-white mx-auto">✓</div><h2 className="text-xl font-extrabold">Order Ho Gaya!</h2><p className="text-5xl font-extrabold tracking-widest">{newPassword}</p><button onClick={()=>router.push("/success")} className="gold-btn w-full text-white py-3 rounded-2xl">Aage Badho</button></main><BottomNav /></>;
  if (!product) return <><Header /><main className="p-4"><p className="text-gray-400">Load ho raha hai...</p></main><BottomNav /></>;

  const q = product.item_type === "tanker"? 1 : qty;
  const price = product.price * q;
  const rate = seller? seller.commission_rate || 5 : 5;
  const commission = Math.round((price * rate) / 100);
  const mapUrl = currLoc? `https://www.google.com/maps?q=${currLoc.lat},${currLoc.lng}` : "";

  return (
    <>
      <Header />
      <main className="flex-1 p-4 space-y-4 pb-24">
        <Link href={"/shop/"+product.seller_id} className="text-blue-600 text-sm">← Wapas</Link>
        <h2 className="text-xl font-bold text-blue-900">Order Confirm Karo</h2>
        <div className="gold-card rounded-2xl p-4">
          <p className="font-bold">{product.item_name}</p>
          <p className="text-sm text-gray-500">{seller?.business_name}</p>
          <p className="text-xs mt-2 text-gray-600"><b>Permanent:</b> {permanentAddress || "Profile me se load ho raha..."}</p>
        </div>

        <div className="bg-white border-2 border-amber-200 rounded-2xl p-4 space-y-2">
          <p className="font-extrabold text-sm">📍 Delivery Location - Current GPS (Naya)</p>
          <p className={`text-xs px-3 py-2 rounded-xl ${currLoc?"bg-green-50 text-green-700 border border-green-200":"bg-amber-50 text-amber-700 border border-amber-200"}`}>{locMsg}</p>
          {currLoc && <a href={mapUrl} target="_blank" className="block bg-blue-50 text-blue-700 text-center font-bold py-2 rounded-xl text-xs">📍 Map pe Dekho</a>}
          <button onClick={getCurrentLocation} disabled={locLoading} className="w-full bg-blue-900 text-white font-bold py-2.5 rounded-xl text-xs disabled:opacity-50">
            {locLoading?"Le raha...":currLoc?"📍 Current GPS Refresh Karo":"📍 Current Location Lo"}
          </button>
          <p className="text-[10px] text-gray-400">Seller ko Permanent Address + Ye Current GPS + Mobile number jayega</p>
        </div>

        <div className="border-2 border-gray-200 rounded-2xl p-4 text-sm space-y-1">
          <div className="flex justify-between"><span>{product.item_name}{product.item_type==="tanker"?"":" x "+q}</span><span>Rs {price}</span></div>
          <div className="flex justify-between"><span>Delivery</span><span className="text-green-600 font-bold">FREE</span></div>
          <div className="flex justify-between font-extrabold text-blue-900 text-base pt-1 border-t"><span>Kul</span><span>Rs {price}</span></div>
        </div>

        <button onClick={placeOrder} disabled={saving ||!currLoc} className="gold-btn w-full text-white text-lg font-bold py-3 rounded-2xl disabled:opacity-50">
          {saving?"Ruko...":!currLoc?"Pehle Current Location Lo":"Order Karo - Rs "+price}
        </button>
      </main>
      <BottomNav />
    </>
  );
}
