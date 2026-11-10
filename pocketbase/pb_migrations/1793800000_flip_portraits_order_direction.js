/// <reference path="../pb_data/types.d.ts" />

/*
  Flip what the ordering numbers mean: the HIGHEST number now comes first.

  Josette reads these boxes as a score, not a queue position. Asked to pull a
  drawing to the front of its category she typed 100 and it went to the back;
  asked to put one at the top of the home strip she typed 1 and it went to the
  front. Same instinct, opposite outcomes. The site now follows the reading she
  reaches for unprompted (see byPlacement in web/src/lib/content.ts).

  Mirroring the stored numbers is what keeps the galleries looking identical
  after the flip: a category numbered 10, 20, 30 ascending becomes 30, 20, 10
  descending, which is the same sequence of drawings. Without this the whole
  site would silently render backwards.

  Two useful side effects:
    - Every numbered drawing in a category comes out with a distinct number, so
      the existing duplicates (two on 20, two on 80 in kinderen) stop being
      decided invisibly by upload date.
    - `homeOrder` is mirrored across every drawing that carries one, not just
      the featured ones, so a drawing whose `featured` tick is currently off
      still lands where Josette put it if she ticks it back on.

  NOT idempotent — mirroring twice returns the original. That is fine: the
  migration table runs it exactly once. Do not re-run it by hand.
*/

const SPACING = 10;

/** Low number first, ties by newest — how the site read these until today. */
function ascending(field) {
  return (a, b) => {
    const byNumber = a.getInt(field) - b.getInt(field);
    if (byNumber !== 0) return byNumber;
    return b.getString("created").localeCompare(a.getString("created"));
  };
}

/** High number first, ties by newest — how the site reads them from now on. */
function descending(field) {
  return (a, b) => {
    const byNumber = b.getInt(field) - a.getInt(field);
    if (byNumber !== 0) return byNumber;
    return b.getString("created").localeCompare(a.getString("created"));
  };
}

/*
  Re-number `records` onto a clean 10, 20, 30 … ladder running in the opposite
  direction to the one they are sorted in, so the drawing that was first stays
  first. The tie-break is spelled out in the comparators above rather than
  relying on a stable sort, which the embedded JS runtime does not promise.
*/
function renumber(app, records, field, comparator, countDown) {
  records.sort(comparator(field));
  const top = records.length * SPACING;
  records.forEach((record, i) => {
    record.set(field, countDown ? top - i * SPACING : (i + 1) * SPACING);
    app.save(record);
  });
}

function eachCategory(all, visit) {
  const byCategory = {};
  for (const record of all) {
    const category = record.getString("category");
    if (!byCategory[category]) byCategory[category] = [];
    byCategory[category].push(record);
  }
  for (const category of Object.keys(byCategory)) visit(byCategory[category]);
}

migrate(
  (app) => {
    const all = app.findRecordsByFilter("portraits", "id != ''", "-created", 1000, 0);

    // `order` — one sequence per category (the gallery page, and the first five
    // of it make the fan on the portfolio index).
    eachCategory(all, (records) => {
      renumber(app, records.filter((r) => r.getInt("order") > 0), "order", ascending, true);
    });

    // `homeOrder` — a single sequence across every category (the home strip).
    renumber(
      app,
      all.filter((r) => r.getInt("homeOrder") > 0),
      "homeOrder",
      ascending,
      true,
    );
  },
  (app) => {
    // Mirror back: read the numbers highest-first and lay them out ascending.
    const all = app.findRecordsByFilter("portraits", "id != ''", "-created", 1000, 0);

    eachCategory(all, (records) => {
      renumber(app, records.filter((r) => r.getInt("order") > 0), "order", descending, false);
    });

    renumber(
      app,
      all.filter((r) => r.getInt("homeOrder") > 0),
      "homeOrder",
      descending,
      false,
    );
  },
);
