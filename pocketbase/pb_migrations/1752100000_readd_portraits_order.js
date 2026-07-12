/// <reference path="../pb_data/types.d.ts" />

/*
  Re-add an optional `order` number to portraits. New, simpler meaning: it ONLY
  affects the category "fan" (the 5-photo folder-card preview). Photos are newest
  by default; setting order 1,2,3... pulls them to the front of the fan in that
  order (1 = centre, 2 = left-middle, 3 = right-middle, 4 = left-outer, 5 = right-outer).
  It does NOT affect the home page (that's the `featured` flag) or the gallery
  pages (always newest). Sorted in-memory, so no index needed.
*/
migrate(
  (app) => {
    const portraits = app.findCollectionByNameOrId("portraits");
    portraits.fields.add(new NumberField({ name: "order", required: false }));
    app.save(portraits);
  },
  (app) => {
    const portraits = app.findCollectionByNameOrId("portraits");
    portraits.fields.removeByName("order");
    app.save(portraits);
  },
);
