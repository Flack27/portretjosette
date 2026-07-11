/// <reference path="../pb_data/types.d.ts" />

/*
  After any change to a content collection, ping the Next app so it can refresh
  the affected cache tag (see web/src/app/api/revalidate/route.ts). Edits made in
  the PocketBase admin therefore appear on the live site within seconds — no
  rebuild required.

  The whole handler is wrapped in try/catch and always calls e.next(), so a
  revalidation problem (e.g. the web app being briefly unreachable) can never
  fail the write that triggered it.

  Requires env on the PocketBase container:
    REVALIDATE_URL    e.g. http://web:3000/api/revalidate
    REVALIDATE_SECRET shared secret (must match the Next app)
*/
function revalidate(e) {
  try {
    const url = $os.getenv("REVALIDATE_URL");
    const secret = $os.getenv("REVALIDATE_SECRET");
    if (url && secret) {
      let collection = "";
      try {
        collection = e.record.collection().name;
      } catch (_) {
        // fall back to revalidating everything
      }
      $http.send({
        url: url,
        method: "POST",
        headers: { "content-type": "application/json", "x-revalidate-secret": secret },
        body: JSON.stringify({ collection: collection }),
        timeout: 10,
      });
    }
  } catch (_) {
    // Revalidation must never break the write that triggered it.
  }
  e.next();
}

const WATCHED = ["portraits", "categories", "prices", "content", "settings"];
onRecordAfterCreateSuccess(revalidate, ...WATCHED);
onRecordAfterUpdateSuccess(revalidate, ...WATCHED);
onRecordAfterDeleteSuccess(revalidate, ...WATCHED);
