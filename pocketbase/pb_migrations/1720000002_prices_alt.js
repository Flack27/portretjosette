/// <reference path="../pb_data/types.d.ts" />

/*
  Portrait prices are shown as an A4/A3 matrix: one row per subject ("Dier",
  "Persoon + dier", …) with a price per format. `price` holds the first column
  (A4), the new `priceAlt` the second (A3).

  `price` also becomes optional, so a subject offered in one format only (the
  trio rows: A3 but no A4) can leave it empty — the site renders "–" there.
*/
migrate(
  (app) => {
    const prices = app.findCollectionByNameOrId("prices");
    prices.fields.add(
      new TextField({ name: "priceAlt", required: false, max: 50 }),
    );
    prices.fields.getByName("price").required = false;
    app.save(prices);
  },
  (app) => {
    const prices = app.findCollectionByNameOrId("prices");
    prices.fields.removeByName("priceAlt");
    prices.fields.getByName("price").required = true;
    app.save(prices);
  },
);
