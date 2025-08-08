import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  canonicalPath?: string;
  structuredData?: Record<string, any>;
}

const SEO = ({ title, description, canonicalPath, structuredData }: SEOProps) => {
  useEffect(() => {
    // Title
    document.title = title;

    const head = document.head;

    const upsertMeta = (
      key: string,
      content: string,
      attr: "name" | "property" = "name"
    ) => {
      let el = head.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // Basic SEO
    upsertMeta("description", description);

    // Open Graph
    upsertMeta("og:title", title, "property");
    upsertMeta("og:description", description, "property");
    upsertMeta("og:type", "website", "property");

    // Twitter
    upsertMeta("twitter:card", "summary_large_image");
    upsertMeta("twitter:title", title);
    upsertMeta("twitter:description", description);

    // Canonical
    const canonicalHref = canonicalPath
      ? new URL(canonicalPath, window.location.origin).toString()
      : window.location.href;
    let linkEl = head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!linkEl) {
      linkEl = document.createElement("link");
      linkEl.setAttribute("rel", "canonical");
      head.appendChild(linkEl);
    }
    linkEl.setAttribute("href", canonicalHref);

    // Structured Data (JSON-LD)
    let ld = head.querySelector(
      'script[type="application/ld+json"]#page-ld'
    ) as HTMLScriptElement | null;
    if (!ld) {
      ld = document.createElement("script");
      ld.type = "application/ld+json";
      ld.id = "page-ld";
      head.appendChild(ld);
    }
    ld.textContent = structuredData ? JSON.stringify(structuredData) : "";
  }, [title, description, canonicalPath, structuredData]);

  return null;
};

export default SEO;
