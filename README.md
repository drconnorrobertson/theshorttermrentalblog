# Short-term rental educational library

Static, dependency-free site for https://theshorttermrentalblog.com. Source answers live in content/ as question|answer|next-step records. Run npm run build, then npm run check. Vercel builds with Node and serves dist/. Git pushes to the connected production branch trigger rebuilds.

The build and check commands also compare rendered blog bodies after normalizing the article-title phrase, capitalization and whitespace. New or expanded duplicate-body groups fail before publication. `editorial/legacy-duplicate-bodies.json` records the known revision backlog, not a quality approval; replace those posts with distinct, sourced answers instead of expanding the baseline to bypass the check. Run `npm run test:content` for its regression cases. Passing this check does not establish factual accuracy, semantic originality or Google indexing eligibility.

The intended complete launch library contains 500 FAQ answers across 20 topic hubs. Publication dates describe publication, not independent expert review. See /editorial for drafting and disclosure information. Brand-specific provider descriptions must be attributed and kept separate from verified customer results. There are no lead forms, promotional calls to action, or advertising trackers in the launch.

Domain setup: add theshorttermrentalblog.com and www.theshorttermrentalblog.com in Vercel; use the exact project-specific DNS records returned by Vercel. Preserve unrelated mail and verification records. Use one canonical hostname and redirect its alternate. Search Console: verify the Domain property with the supplied DNS TXT record, then submit https://theshorttermrentalblog.com/sitemap.xml. Submission does not guarantee indexing.
