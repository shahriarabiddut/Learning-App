"use server";
import { IMGBB_KEY } from "../constants/env";

export async function uploadImageInIMGBB(uploadedImage: File) {
  const imageForm = new FormData();
  imageForm.append("image", uploadedImage);

  const imgbbRes = await fetch(
    `https://api.imgbb.com/1/upload?key=${IMGBB_KEY}`,
    {
      method: "POST",
      body: imageForm,
    }
  );

  if (!imgbbRes.ok) {
    throw new Error("Failed to upload image");
  }

  const result = await imgbbRes.json();
  if (result.success) {
    return result.data.display_url;
  } else {
    throw new Error("Image upload failed");
  }
}
