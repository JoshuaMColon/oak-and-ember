import { NextResponse } from "next/server";
import { getAccess } from "@/lib/access";
import { createServerSupabase } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const access = await getAccess();
  if (access !== "admin") {
    return NextResponse.json({ error: "Only an admin can upload images." }, { status: 403 });
  }
  const supabase = await createServerSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase storage is not configured." }, { status: 503 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Choose an image." }, { status: 400 });
  }
  if (file.size > 4_000_000) {
    return NextResponse.json({ error: "Images must be under 4 MB." }, { status: 400 });
  }
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return NextResponse.json({ error: "Use a JPEG, PNG, or WebP." }, { status: 400 });
  }

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${crypto.randomUUID()}.${extension}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const { error } = await supabase.storage.from("product-images").upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
