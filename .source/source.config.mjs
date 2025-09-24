// source.config.ts
import { defineConfig, defineDocs, frontmatterSchema, metaSchema } from "fumadocs-mdx/config";
var docs = defineDocs({
  docs: {
    schema: frontmatterSchema
  },
  meta: {
    schema: metaSchema
  }
});
var source_config_default = defineConfig({
  mdxOptions: {
    // MDX options
  },
  project: {
    link: "https://github.com/your-org/your-repo"
    // Shows next to dark/light toggle
  }
});
export {
  source_config_default as default,
  docs
};
