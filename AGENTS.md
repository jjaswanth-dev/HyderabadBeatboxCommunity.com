<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Tracker: Configurable Beatbox Wildcard Feature

## 1. Past Status (Start of Development)
- All wildcard submission guidelines were static or hardcoded, with no way to customize them or turn them off.
- No database model or admin panel manager existed for wildcard configurations.
- The homepage layout and navigation headers had no connection to wildcard settings.

## 2. Present Status (Current Implementation)
- **Database Schema:** Created [models/Wildcard.ts](file:///d:/Dev%20Workspace/HBX%20Site%20Deployed/hyd%20bbx%20Ful%20fledged%20website%20M(1)%20Deployed/models/Wildcard.ts) to hold section states, titles, rules descriptions, ImageKit posters, and form URLs. Initialized with default values for the Hyderabad Beatbox Championship 2026.
- **Backend API Route:** Created [app/api/wildcard/route.ts](file:///d:/Dev%20Workspace/HBX%20Site%20Deployed/hyd%20bbx%20Ful%20fledged%20website%20M(1)%20Deployed/app/api/wildcard/route.ts) for secure GET/POST updates, with a fallback database connection seeding default guidelines content.
- **Dedicated Subpage Redesign:** Overhauled [app/wildcard/page.tsx](file:///d:/Dev%20Workspace/HBX%20Site%20Deployed/hyd%20bbx%20Ful%20fledged%20website%20M(1)%20Deployed/app/wildcard/page.tsx) with a highly-polished custom React elements layout, featuring dedicated blocks for submission timeline dates, guidelines checklist, Allowed/Not Allowed mixing categories, and criteria points distribution.
- **Brand Typography & Theme Highlights:** Integrated the home page's unified **Lexend** font on the wildcard page and styled icons, badges, borders, and checklist boxes using theme-aligned colors (Sky Blue `text-sky-400`, Emerald Green `text-emerald-400`, and Rose Red `text-rose-400`).
- **Admin settings:** Built [components/admin/WildcardManager.tsx](file:///d:/Dev%20Workspace/HBX%20Site%20Deployed/hyd%20bbx%20Ful%20fledged%20website%20M(1)%20Deployed/components/admin/WildcardManager.tsx) for direct client-side poster uploads via ImageKit SDK, guideline edits, and visibility toggling. Registered this in the Admin Dashboard tab items.
- **Home Integration:** Updated [Header.tsx](file:///d:/Dev%20Workspace/HBX%20Site%20Deployed/hyd%20bbx%20Ful%20fledged%20website%20M(1)%20Deployed/components/Header.tsx) and [ImageCarousel.tsx](file:///d:/Dev%20Workspace/HBX%20Site%20Deployed/hyd%20bbx%20Ful%20fledged%20website%20M(1)%20Deployed/components/ImageCarousel.tsx) to query status on mount, dynamically display redirection buttons, and shift vertical page alignment.
- **Visual styling:** Implemented slow breathing link glows, liquid shifting background gradients, and sliding shimmer sweeps (defined at the bottom of `globals.css`).

---

## 3. Future Status: Deleting the Wildcard Feature
When the wildcard submission period is over and you want to **permanently delete** this feature without disturbing the remaining codebase, execute the following steps:

### A. Remove Feature Files
Propose commands or manually delete the following files and directories:
1. Delete [models/Wildcard.ts](file:///d:/Dev%20Workspace/HBX%20Site%20Deployed/hyd%20bbx%20Ful%20fledged%20website%20M(1)%20Deployed/models/Wildcard.ts)
2. Delete [app/api/wildcard/route.ts](file:///d:/Dev%20Workspace/HBX%20Site%20Deployed/hyd%20bbx%20Ful%20fledged%20website%20M(1)%20Deployed/app/api/wildcard/route.ts)
3. Delete [components/admin/WildcardManager.tsx](file:///d:/Dev%20Workspace/HBX%20Site%20Deployed/hyd%20bbx%20Ful%20fledged%20website%20M(1)%20Deployed/components/admin/WildcardManager.tsx)
4. Delete the wildcard folder at [app/wildcard/](file:///d:/Dev%20Workspace/HBX%20Site%20Deployed/hyd%20bbx%20Ful%20fledged%20website%20M(1)%20Deployed/app/wildcard/)

### B. Revert Admin Dashboard Integration
In [app/admin/dashboard/[[...slug]]/page.tsx](file:///d:/Dev%20Workspace/HBX%20Site%20Deployed/hyd%20bbx%20Ful%20fledged%20website%20M(1)%20Deployed/app/admin/dashboard/[[...slug]]/page.tsx):
1. Delete the dynamic import statement for `WildcardManager`:
   ```typescript
   const WildcardManager = dynamic(() => import("@/components/admin/WildcardManager"), ...);
   ```
2. Remove the routing check from `getActiveManager()`:
   ```typescript
   if (pathname?.includes("/wildcard")) return <WildcardManager />;
   ```
3. Remove the link from the `navItems` array:
   ```typescript
   { href: "/admin/dashboard/wildcard", label: "Manage Wildcard" },
   ```
4. Restore the grid column width classes:
   Replace `lg:grid-cols-6` with `lg:grid-cols-5` on the navigation outer container.

### C. Revert Navigation Header Integration
In [components/Header.tsx](file:///d:/Dev%20Workspace/HBX%20Site%20Deployed/hyd%20bbx%20Ful%20fledged%20website%20M(1)%20Deployed/components/Header.tsx):
1. Delete the `isWildcardActive` state hook and its corresponding `/api/wildcard` check `useEffect` block.
2. Revert the `sections` array declaration back to the standard hardcoded list:
   ```typescript
   const sections = ["home", "about", "events", "gallery", "videos", "blog", "contact"];
   ```
3. Revert `scrollToSection()`:
   Remove the first `if (id === "wildcard") { ... }` block. Remove the fallback `else { window.location.href = ... }` if not needed.
4. Remove the `animate-pulse-glow` ternary classes from the desktop and mobile button headers.

### D. Revert Hero Slider Integration
In [components/ImageCarousel.tsx](file:///d:/Dev%20Workspace/HBX%20Site%20Deployed/hyd%20bbx%20Ful%20fledged%20website%20M(1)%20Deployed/components/ImageCarousel.tsx):
1. Delete the `isWildcardActive` state hook and its corresponding `useEffect` block.
2. Delete the rendering block for the CTA button:
   ```tsx
   {isWildcardActive && (
     <button onClick={...}>Submit Wildcards Now!</button>
   )}
   ```
3. Restore the original text vertical margin:
   Change the text container class `mt-28 md:mt-36` back to `mt-80`.

### E. Clean Up Styling Sheet
In [app/globals.css](file:///d:/Dev%20Workspace/HBX%20Site%20Deployed/hyd%20bbx%20Ful%20fledged%20website%20M(1)%20Deployed/app/globals.css), scroll to the bottom and remove the appended custom rule blocks:
- `@keyframes pulse-glow` & `.animate-pulse-glow`
- `@keyframes gradient-shift` & `@keyframes btn-shimmer`
- `.btn-wildcard-premium` (including hover and after selectors)
- `@keyframes button-glow-pulse` & `.animate-button-glow`

---

> [!NOTE]
> For the comprehensive project history, architecture, and documentation across all features (Blog System, Dome Gallery, Event Details & Social Share, Bento About Section), refer to [PROJECT_CONTEXT.md](file:///d:/Dev%20Workspace/HBX%20Site%20Deployed/hyd%20bbx%20Ful%20fledged%20website%20M(1)%20Deployed/PROJECT_CONTEXT.md).

