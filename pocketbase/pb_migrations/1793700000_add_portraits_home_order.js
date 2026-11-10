/// <reference path="../pb_data/types.d.ts" />

/*
  Split the two orderings that were sharing one field.

  Until now `order` only drove the 5-photo fan on the portfolio index, the
  gallery pages were always newest-first with no control at all, and `featured`
  decided the home strip without deciding its sequence. The field names did not
  mean what they looked like, and only five numbers were ever useful, so the
  same values ended up reused several times inside one category.

  From here:
    order      position inside its own category. Drives the gallery page, and
               the fan simply takes the first five. 0 or empty means "no
               preference": those fall in behind the numbered ones, newest
               first. Spaced 10, 20, 30 so moving one photo is one edit.
    homeOrder  position in the home page strip, for photos with `featured` on.
               Same 0-means-newest rule, also spaced by ten.

  Both are sorted in memory, so neither needs an index.
*/
migrate(
  (app) => {
    const portraits = app.findCollectionByNameOrId("portraits");
    portraits.fields.add(new NumberField({ name: "homeOrder", required: false }));
    app.save(portraits);
  },
  (app) => {
    const portraits = app.findCollectionByNameOrId("portraits");
    portraits.fields.removeByName("homeOrder");
    app.save(portraits);
  },
);
