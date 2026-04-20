import { hasParentSession } from "@/lib/auth";
import { readStore } from "@/lib/store";

export async function GET() {
  const authorized = await hasParentSession();
  if (!authorized) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const store = await readStore();
  const fileName = `kids-jars-backup-${new Date().toISOString().slice(0, 10)}.json`;

  return new Response(JSON.stringify(store, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="${fileName}"`
    }
  });
}
