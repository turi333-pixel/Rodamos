import { NextRequest, NextResponse } from "next/server";
import { getWeather } from "@/lib/weather";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat  = parseFloat(searchParams.get("lat")  ?? "0");
  const lng  = parseFloat(searchParams.get("lng")  ?? "0");
  const date = searchParams.get("date");

  if (!lat || !lng) {
    return NextResponse.json({ error: "Se requieren coordenadas" }, { status: 400 });
  }

  const targetDate = date ? new Date(date) : new Date();
  const weather = await getWeather({ lat, lng }, targetDate);

  if (!weather) {
    return NextResponse.json({ error: "No se pudo obtener el clima" }, { status: 503 });
  }

  return NextResponse.json(weather);
}
