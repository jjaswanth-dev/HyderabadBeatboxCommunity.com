This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 🏆 Championship System & Results Mode
The platform features an automated tournament scoring and bracket system:
- **Yearly Contender Management:** Directly manage National and Regional participants (Add, Edit, Remove, Statuses) from the Admin Dashboard (`/admin/dashboard/championship`) without hardcoded resets.
- **Dynamic Ticket Manager:** Toggle homepage ticket sales, customize booking links (Google Forms, BookMyShow, PayTM Insider), and preview vintage tickets directly from the Admin Dashboard (`/admin/dashboard/ticket`).
- **Post-Championship Mode:** Configured for completed events with **`CHAMPIONSHIP RESULTS 2026`** in navigation and official results badge on `/championship`.
- **Operations & Teardown Playbooks:** See [CHAMPIONSHIP_OPERATIONS_GUIDE.md](file:///d:/Dev%20Workspace/HBX%20Site%20Deployed/hyd%20bbx%20Ful%20fledged%20website%20M(1)%20Deployed/CHAMPIONSHIP_OPERATIONS_GUIDE.md), [PROJECT_CONTEXT.md](file:///d:/Dev%20Workspace/HBX%20Site%20Deployed/hyd%20bbx%20Ful%20fledged%20website%20M(1)%20Deployed/PROJECT_CONTEXT.md), and [AGENTS.md](file:///d:/Dev%20Workspace/HBX%20Site%20Deployed/hyd%20bbx%20Ful%20fledged%20website%20M(1)%20Deployed/AGENTS.md) for complete technical architecture, operations guides, and feature management steps.

## 📝 Blog Engine & Pure Markdown System
The blog system is powered by a clean, secure, and responsive **Pure Markdown** architecture:
- **Markdown (.md) Direct Uploads & Live Previews:** Supports `.md`, `.markdown`, and `.txt` file uploads with instant parsing. Automatic title extraction from `# Main Heading`.
- **Pure Markdown Rendering via `react-markdown`:** Streamlined markdown pipeline using `remark-gfm` (tables, task lists, strikethroughs, autolinks) and `remark-breaks` (natural linebreaks).
- **Zero HTML Bleed & Complete Security:** Uninstalled `rehype-raw` and removed raw HTML injection. Unsafe HTML, scripts, and embedded style tags are completely stripped, preventing any third-party styling leaks, DOM corruption, or layout breakages.
- **Enhanced Markdown Formatting Toolbar:** 1-click shortcuts for bold, italics, H1/H2/H3 headers, bullet/numbered lists, quotes, hyperlinks, inline code (`` `code` ``), GFM tables, task lists, and horizontal dividers.
- **Mobile & iPhone Visibility Reliability:** Implemented mount-state fallback triggers in `Section.tsx` so articles fade in reliably on mobile Safari and iOS without waiting on sluggish intersection observers.
- **Mobile-Responsive Tables & Images:** Automatic horizontal scrolling for tables (`-webkit-overflow-scrolling: touch`) and constrained image dimensions prevent canvas widening or horizontal scrolling bugs on smartphones.
- **Admin Reviewer & Inline Editor:** Admin dashboard allows previewing posts directly via `BlogDetail` and inline editing with live markdown preview before approving or rejecting.

## 🚀 Hero Image Carousel Optimization
- **Server Pre-fetch (`app/page.tsx`):** Pre-fetches the active homepage image list directly on the server before HTML is streamed to the browser, eliminating the client-side JavaScript fetch waterfall.
- **Single Static Fallback (`/home1.webp`):** The carousel initializes with `/home1.webp` (220KB) as the guaranteed instant background, ensuring 0ms blank screens even during cold starts.
- **Direct Edge CDN Delivery (`unoptimized={src.startsWith("http")}`):** Bypasses the internal Next.js image proxy for ImageKit URLs, allowing ImageKit's global CDN to deliver images directly with ultra-low latency.




