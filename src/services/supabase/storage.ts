import type * as ImagePicker from "expo-image-picker";
import { supabase } from "./client";

export async function uploadAvatar(
  userId: string,
  asset: ImagePicker.ImagePickerAsset
) {
  const extension =
    asset.fileName?.split(".").pop()?.toLowerCase() ||
    asset.mimeType?.split("/").pop() ||
    "jpg";
  const path = `${userId}/${Date.now()}.${extension}`;
  const response = await fetch(asset.uri);
  const file = await response.arrayBuffer();

  const { error } = await supabase.storage.from("avatars").upload(path, file, {
    contentType: asset.mimeType ?? "image/jpeg",
    upsert: true
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return data.publicUrl;
}
