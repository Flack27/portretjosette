/// <reference path="../pb_data/types.d.ts" />

/*
  Re-space the existing ordering numbers onto 10, 20, 30 and seed `homeOrder`.

  Josette's numbers were 1-5 and, because they only ever drove five fan slots,
  several works inside one category share a value (kinderen and huisdieren each
  have 1-5 twice over). Dense numbers are also why reordering meant retyping the
  lot: with gaps, moving one work is one edit.

  This preserves the order the site renders today, so nothing visibly moves:
  works are read newest-first and ties on `order` are broken by newest, which is
  exactly how the old in-memory sort resolved them.

  Idempotent: re-spacing 10, 20, 30 yields 10, 20, 30, so a second run is a
  no-op. Works with no number keep 0, which means "no preference, newest first".
*/
migrate(
  (app) => {
    const SPACING = 10;
    const all = app.findRecordsByFilter("portraits", "id != ''", "-created", 1000, 0);

    // --- `order`: a sequence per category -----------------------------------
    const byCategory = {};
    for (const record of all) {
      const category = record.getString("category");
      if (!byCategory[category]) byCategory[category] = [];
      byCategory[category].push(record);
    }

    for (const category of Object.keys(byCategory)) {
      const numbered = byCategory[category].filter((r) => r.getInt("order") > 0);

      // The tie-break is spelled out rather than relying on a stable sort, which
      // the embedded JS runtime does not promise.
      numbered.sort((a, b) => {
        const byOrder = a.getInt("order") - b.getInt("order");
        if (byOrder !== 0) return byOrder;
        return b.getString("created").localeCompare(a.getString("created"));
      });

      numbered.forEach((record, i) => {
        record.set("order", (i + 1) * SPACING);
        app.save(record);
      });
    }

    // --- `homeOrder`: the home strip's sequence ------------------------------
    // Seeded in the order the strip shows today (newest featured first), so
    // Josette starts from a list that matches what she already sees.
    all
      .filter((record) => record.getBool("featured"))
      .forEach((record, i) => {
        record.set("homeOrder", (i + 1) * SPACING);
        app.save(record);
      });
  },
  (app) => {
    // The original dense values had duplicates, so there is nothing faithful to
    // restore. Rolling back only clears the home strip's sequence; `order` keeps
    // whatever it holds, which still renders in the same sequence.
    const all = app.findRecordsByFilter("portraits", "id != ''", "-created", 1000, 0);
    for (const record of all) {
      record.set("homeOrder", 0);
      app.save(record);
    }
  },
);
