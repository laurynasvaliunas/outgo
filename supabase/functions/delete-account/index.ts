import {
  createServiceClient,
  jsonResponse
} from "../_shared/push.ts";

type DeleteAccountRequest = {
  confirmationText?: string;
};

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const authorization = request.headers.get("authorization") ?? "";
    const jwt = authorization.replace(/^Bearer\s+/i, "").trim();
    if (!jwt) {
      return jsonResponse({ error: "Missing authorization token" }, 401);
    }

    const body = (await request.json()) as DeleteAccountRequest;
    if (body.confirmationText !== "DELETE") {
      return jsonResponse({ error: "Confirmation text must be DELETE" }, 400);
    }

    const supabase = createServiceClient();
    const { data: userData, error: userError } = await supabase.auth.getUser(jwt);
    if (userError || !userData.user) {
      return jsonResponse({ error: "Invalid authorization token" }, 401);
    }

    await removeAvatarFiles(supabase, userData.user.id);

    const { error: deleteError } = await supabase.auth.admin.deleteUser(
      userData.user.id
    );
    if (deleteError) {
      throw deleteError;
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

async function removeAvatarFiles(
  supabase: ReturnType<typeof createServiceClient>,
  userId: string
) {
  const { data, error } = await supabase.storage.from("avatars").list(userId);
  if (error || !data?.length) {
    return;
  }

  const paths = data.map((item) => `${userId}/${item.name}`);
  await supabase.storage.from("avatars").remove(paths);
}
