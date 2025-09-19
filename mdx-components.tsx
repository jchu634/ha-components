import defaultMdxComponents from "fumadocs-ui/mdx";
import * as TabsComponents from "fumadocs-ui/components/tabs";
import * as AccordionComponents from "fumadocs-ui/components/accordion";
import type { MDXComponents } from "mdx/types";

// use this function to get MDX components, you will need it for rendering MDX
export function getMDXComponents(components?: MDXComponents): MDXComponents {
    return {
        ...defaultMdxComponents,
        ...TabsComponents,
        ...AccordionComponents,
        ...components,
    };
}
