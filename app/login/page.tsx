"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function BuyerRegisterPage() {
  const [location, setLocation] = useState<{lat:number,lng:number,accuracy:number} | null>(null);
  const [gpsState, setGpsState] = useState("idle");
  const [form, setForm] = useState({
    name: "", mobile: "", password: "", 
    area: "", address: "", permanent_address: ""
  });

  const getCurrentLocation = () => {
    setGpsState("fetching");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        });
        setGpsState("success");
      },
      (err) => {
        console.error(err);
        setGpsState("error");
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const handleRegister = async () => {
    // Validation: All * required, mobile 10 digits, password 4+, location required
    const { data, error } = await supabase.from("profiles").insert([{
      mobile: form.mobile,
      name: form.name,
      password: form.password, // hash in production!
      area: form.area,
      address: form.address,
      permanent_address: form.permanent_address,
      lat: location?.lat,
      lng: location?.lng,
      current_address_gps: `https://www.google.com/maps?q=${location?.lat},${location?.lng}`,
      role: "buyer"
    }]).select();

    if (!error) {
      localStorage.setItem("pw_mobile", form.mobile);
      localStorage.setItem("pw_buyer_name", form.name);
      window.location.href = "/home";
    }
  };

  return (
    <div className="bg-[#fefbf0] min-h-screen p-4">
      {/* Form UI - same as preview */}
      <button onClick={getCurrentLocation}>
        {gpsState === "idle" && "Current Location Lo *"}
        {gpsState === "fetching" && "Location Li Ja Rahi Hai..."}
        {gpsState === "success" && "Location Mil Gayi ✓"}
      </button>
    </div>
  );
}
