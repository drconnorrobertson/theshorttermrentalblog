# Short-term rental educational library

Static, dependency-free site for https://theshorttermrentalblog.com. Source answers live in content/ as question|answer|next-step records. Run npm run build, then npm run check. Vercel builds with Node and serves dist/. Git pushes to the connected production branch trigger rebuilds.

The intended complete launch library contains 500 FAQ answers across 20 topic hubs. Publication dates describe publication, not independent expert review. See /editorial for drafting and disclosure information. Brand-specific provider descriptions must be attributed and kept separate from verified customer results. There are no lead forms, promotional calls to action, or advertising trackers in the launch.

Domain setup: add theshorttermrentalblog.com and www.theshorttermrentalblog.com in Vercel; use the exact project-specific DNS records returned by Vercel. Preserve unrelated mail and verification records. Use one canonical hostname and redirect its alternate. Search Console: verify the Domain property with the supplied DNS TXT record, then submit https://theshorttermrentalblog.com/sitemap.xml. Submission does not guarantee indexing.
