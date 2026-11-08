import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 10 days in seconds (10 * 24 * 60 * 60)
const RETRY_AFTER_SECONDS = "864000";

function generateChromeErrorHtml(host: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${host}</title>
  <style>
    :root {
      --bg-color: #ffffff;
      --text-primary: #202124;
      --text-secondary: #5f6368;
      --btn-bg: #1a73e8;
      --btn-text: #ffffff;
      --btn-hover: #1765cc;
      --btn-secondary-border: #dadce0;
      --btn-secondary-text: #1a73e8;
      --icon-fill: #5f6368;
      --code-color: #5f6368;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --bg-color: #202124;
        --text-primary: #e8eaed;
        --text-secondary: #9aa0a6;
        --btn-bg: #8ab4f8;
        --btn-text: #202124;
        --btn-hover: #93bcf8;
        --btn-secondary-border: #5f6368;
        --btn-secondary-text: #8ab4f8;
        --icon-fill: #9aa0a6;
        --code-color: #9aa0a6;
      }
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-color);
      color: var(--text-primary);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      padding: 10vh 1.5rem 2rem;
    }

    .main-frame {
      max-width: 600px;
      margin: 0 auto;
      width: 100%;
    }

    .icon-wrapper {
      margin-bottom: 2rem;
    }

    .icon-wrapper svg {
      width: 48px;
      height: 48px;
      fill: var(--icon-fill);
    }

    h1 {
      font-size: 1.5rem;
      font-weight: 500;
      line-height: 1.35;
      margin-bottom: 1.5rem;
      color: var(--text-primary);
    }

    p {
      font-size: 0.9375rem;
      line-height: 1.6;
      color: var(--text-secondary);
      margin-bottom: 1rem;
    }

    .hostname-highlight {
      font-weight: 500;
      color: var(--text-primary);
    }

    ul {
      list-style-type: disc;
      padding-left: 1.5rem;
      margin: 1.25rem 0 1.75rem 0;
      color: var(--text-secondary);
      font-size: 0.9375rem;
      line-height: 1.6;
    }

    li {
      margin-bottom: 0.5rem;
    }

    .error-code {
      font-size: 0.8125rem;
      color: var(--code-color);
      font-family: monospace;
      margin-top: 1.5rem;
      letter-spacing: 0.02em;
    }

    .action-row {
      margin-top: 2rem;
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .btn-reload {
      background-color: var(--btn-bg);
      color: var(--btn-text);
      border: none;
      font-size: 0.875rem;
      font-weight: 500;
      padding: 0.55rem 1.25rem;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.15s ease;
      font-family: inherit;
    }

    .btn-reload:hover {
      background-color: var(--btn-hover);
    }

    .btn-details {
      background: transparent;
      border: 1px solid var(--btn-secondary-border);
      color: var(--btn-secondary-text);
      font-size: 0.875rem;
      font-weight: 500;
      padding: 0.55rem 1rem;
      border-radius: 4px;
      cursor: pointer;
      font-family: inherit;
    }

    .details-content {
      display: none;
      margin-top: 1.5rem;
      padding-top: 1.5rem;
      border-top: 1px solid var(--btn-secondary-border);
      font-size: 0.875rem;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .details-content.show {
      display: block;
    }
  </style>
</head>
<body>
  <div class="main-frame">
    <!-- Authentic Chrome network error icon (page with folded corner) -->
    <div class="icon-wrapper">
      <svg viewBox="0 0 24 24">
        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
      </svg>
    </div>

    <h1>This site can’t be reached</h1>

    <p>
      Check if there is a typo in <span class="hostname-highlight">${host}</span>.
    </p>

    <ul>
      <li>If spelling is correct, try running Windows Network Diagnostics.</li>
    </ul>

    <div class="error-code">
      DNS_PROBE_FINISHED_NXDOMAIN
    </div>

    <div class="action-row">
      <button class="btn-reload" onclick="location.reload()">Reload</button>
      <button class="btn-details" id="toggleBtn" onclick="toggleDetails()">Details</button>
    </div>

    <div class="details-content" id="detailsBox">
      <p>
        The server at <strong>${host}</strong> can't be found because the DNS lookup failed. DNS is the network service that translates a website’s name to its Internet address. This error is most often caused by having no connection to the Internet or a misconfigured network. It can also be caused by an unresponsive DNS server or a firewall preventing Google Chrome from accessing the network.
      </p>
    </div>
  </div>

  <script>
    function toggleDetails() {
      const box = document.getElementById('detailsBox');
      const btn = document.getElementById('toggleBtn');
      if (box.classList.contains('show')) {
        box.classList.remove('show');
        btn.textContent = 'Details';
      } else {
        box.classList.add('show');
        btn.textContent = 'Hide details';
      }
    }
  </script>
</body>
</html>`;
}

export function middleware(request: NextRequest) {
  // Check maintenance flags
  const isMaintenanceActive =
    process.env.MAINTENANCE_MODE === "true" ||
    process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true" ||
    process.env.SITE_PAUSED === "true" ||
    process.env.NEXT_PUBLIC_SITE_PAUSED === "true";

  // If maintenance is OFF, let everything pass normally
  if (!isMaintenanceActive) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Let browser favicon and static chunks pass
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Get the actual domain visited (e.g., hydbbx.com, hyderabadbeatboxcommunity.in, or localhost)
  const host = request.headers.get("host") || "hyderabadbeatboxcommunity.in";

  // Return the authentic Chrome error page with HTTP 503 + Retry-After header
  return new NextResponse(generateChromeErrorHtml(host), {
    status: 503,
    statusText: "Service Unavailable",
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Retry-After": RETRY_AFTER_SECONDS,
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    },
  });
}

export const config = {
  // Match all routes except Next.js internal static assets
  matcher: ["/((?!_next/static|_next/image).*)"],
};
