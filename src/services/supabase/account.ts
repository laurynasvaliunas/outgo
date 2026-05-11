import { supabase } from "./client";

export async function deleteCurrentAccount(confirmationText: string) {
  const { error } = await supabase.functions.invoke("delete-account", {
    body: { confirmationText }
  });

  if (error) {
    throw error;
  }
}
