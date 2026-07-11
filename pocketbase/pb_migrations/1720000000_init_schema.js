/// <reference path="../pb_data/types.d.ts" />

/*
  Schema for "Portret door Josette".
  Collections: portraits, categories, prices, content, settings.

  Access rules: public READ (listRule/viewRule = ""), writes restricted to
  superusers (create/update/deleteRule = null). The public site therefore reads
  with no auth; Josette manages everything from the PocketBase admin UI.

  Targets the PocketBase v0.23+ JS migration API. Pin the PB version in the
  Dockerfile so this matches the running binary.
*/

migrate(
  (app) => {
    const autodate = (name, onUpdate) => ({
      name,
      type: "autodate",
      onCreate: true,
      onUpdate,
    });

    // ── portraits ────────────────────────────────────────────────────────────
    const portraits = new Collection({
      type: "base",
      name: "portraits",
      listRule: "",
      viewRule: "",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: "title", type: "text", required: true, max: 200 },
        {
          name: "category",
          type: "select",
          required: true,
          maxSelect: 1,
          values: ["mensen", "kinderen", "huisdieren", "natuur"],
        },
        {
          name: "medium",
          type: "select",
          required: false,
          maxSelect: 1,
          values: ["Pastelkrijt", "Grafiet", "Houtskool"],
        },
        {
          name: "image",
          type: "file",
          required: true,
          maxSelect: 1,
          maxSize: 8388608,
          mimeTypes: ["image/webp", "image/jpeg", "image/png", "image/avif"],
          thumbs: ["600x0", "1200x0"],
        },
        { name: "order", type: "number", required: false },
        { name: "featured", type: "bool", required: false },
        { name: "alt", type: "text", required: false, max: 300 },
        autodate("created", false),
        autodate("updated", true),
      ],
      indexes: [
        "CREATE INDEX `idx_portraits_category` ON `portraits` (`category`, `order`)",
      ],
    });
    app.save(portraits);

    // ── categories ───────────────────────────────────────────────────────────
    const categories = new Collection({
      type: "base",
      name: "categories",
      listRule: "",
      viewRule: "",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: "name", type: "text", required: true, max: 100 },
        { name: "slug", type: "text", required: true, max: 100 },
        { name: "blurb", type: "text", required: false, max: 500 },
        { name: "order", type: "number", required: false },
        autodate("created", false),
        autodate("updated", true),
      ],
      indexes: [
        "CREATE UNIQUE INDEX `idx_categories_slug` ON `categories` (`slug`)",
      ],
    });
    app.save(categories);

    // ── prices ───────────────────────────────────────────────────────────────
    const prices = new Collection({
      type: "base",
      name: "prices",
      listRule: "",
      viewRule: "",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: "group",
          type: "select",
          required: true,
          maxSelect: 1,
          values: ["Portretten", "Klein werk", "Afwerking"],
        },
        { name: "label", type: "text", required: true, max: 200 },
        { name: "sublabel", type: "text", required: false, max: 300 },
        { name: "price", type: "text", required: true, max: 50 },
        { name: "note", type: "text", required: false, max: 300 },
        { name: "order", type: "number", required: false },
        autodate("created", false),
        autodate("updated", true),
      ],
      indexes: [
        "CREATE INDEX `idx_prices_group` ON `prices` (`group`, `order`)",
      ],
    });
    app.save(prices);

    // ── content (editable copy blocks) ───────────────────────────────────────
    const content = new Collection({
      type: "base",
      name: "content",
      listRule: "",
      viewRule: "",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: "key", type: "text", required: true, max: 100 },
        { name: "label", type: "text", required: false, max: 200 },
        { name: "group", type: "text", required: false, max: 100 },
        { name: "value", type: "text", required: false, max: 5000 },
        autodate("created", false),
        autodate("updated", true),
      ],
      indexes: ["CREATE UNIQUE INDEX `idx_content_key` ON `content` (`key`)"],
    });
    app.save(content);

    // ── settings (single record) ─────────────────────────────────────────────
    const settings = new Collection({
      type: "base",
      name: "settings",
      listRule: "",
      viewRule: "",
      createRule: null,
      updateRule: null,
      deleteRule: null,
      fields: [
        { name: "email", type: "text", required: false, max: 200 },
        { name: "locality", type: "text", required: false, max: 100 },
        { name: "region", type: "text", required: false, max: 100 },
        { name: "countryName", type: "text", required: false, max: 100 },
        { name: "facebook", type: "url", required: false },
        { name: "instagram", type: "url", required: false },
        { name: "responseTime", type: "text", required: false, max: 300 },
        { name: "mapEmbedUrl", type: "url", required: false },
        autodate("created", false),
        autodate("updated", true),
      ],
    });
    app.save(settings);
  },

  (app) => {
    for (const name of ["portraits", "categories", "prices", "content", "settings"]) {
      try {
        app.delete(app.findCollectionByNameOrId(name));
      } catch (_) {
        // already gone
      }
    }
  },
);
