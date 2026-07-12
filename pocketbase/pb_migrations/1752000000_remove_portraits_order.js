/// <reference path="../pb_data/types.d.ts" />

/*
  Remove the now-unused `order` field from portraits. Gallery + category-fan
  ordering is newest-first with a `featured` pin (see web/src/lib/content.ts),
  so `order` is dead weight that only confuses the admin. The category index
  referenced `order`, so recreate it on `category` alone.
*/
migrate(
  (app) => {
    const portraits = app.findCollectionByNameOrId("portraits");
    portraits.indexes = [
      "CREATE INDEX `idx_portraits_category` ON `portraits` (`category`)",
    ];
    portraits.fields.removeByName("order");
    app.save(portraits);
  },
  (app) => {
    const portraits = app.findCollectionByNameOrId("portraits");
    portraits.fields.add(new NumberField({ name: "order", required: false }));
    portraits.indexes = [
      "CREATE INDEX `idx_portraits_category` ON `portraits` (`category`, `order`)",
    ];
    app.save(portraits);
  },
);
