/// <reference path="../pb_data/types.d.ts" />

/*
  Add editable hero + over-mij images to the settings collection, so Josette can
  swap the two big "brand" photos from the admin UI. Optional single-file fields;
  when empty, the site falls back to the built-in defaults.
*/
migrate(
  (app) => {
    const settings = app.findCollectionByNameOrId("settings");
    const imageField = (name) =>
      new FileField({
        name,
        required: false,
        maxSelect: 1,
        maxSize: 8388608,
        mimeTypes: ["image/webp", "image/jpeg", "image/png", "image/avif"],
        thumbs: ["800x0", "1600x0"],
      });

    settings.fields.add(imageField("heroImage"));
    settings.fields.add(imageField("overMijImage"));
    app.save(settings);
  },
  (app) => {
    const settings = app.findCollectionByNameOrId("settings");
    settings.fields.removeByName("heroImage");
    settings.fields.removeByName("overMijImage");
    app.save(settings);
  },
);
