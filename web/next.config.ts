import type { NextConfig } from "next";

/**
 * PocketBase serves the gallery images. next/image needs the PB host allow-listed
 * so it can fetch + optimise those files. We derive the pattern from the public PB
 * URL and always include the local dev host (127.0.0.1:8090 / localhost:8090).
 */
const pbUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "http://127.0.0.1:8090";

function pbRemotePattern() {
  try {
    const u = new URL(pbUrl);
    return [
      {
        protocol: u.protocol.replace(":", "") as "http" | "https",
        hostname: u.hostname,
        port: u.port || "",
        pathname: "/api/files/**",
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  // Emit a self-contained server bundle for the Docker image.
  output: "standalone",
  images: {
    remotePatterns: [
      ...pbRemotePattern(),
      { protocol: "http", hostname: "127.0.0.1", port: "8090", pathname: "/api/files/**" },
      { protocol: "http", hostname: "localhost", port: "8090", pathname: "/api/files/**" },
    ],
    // Next blocks optimizing images that resolve to a private/loopback IP (SSRF
    // guard). In local dev PocketBase is at 127.0.0.1, so allow it there only —
    // in production PB is a public host, so the guard stays on.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
  },
};

export default nextConfig;
