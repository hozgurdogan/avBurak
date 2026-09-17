/**
 * Single source of truth for whether cookies require HTTPS. Mirrored by
 * `HTTPS_IS_LIVE` in next.config.ts - flip both together (and rebuild) once
 * the production domain has a real, trusted TLS certificate. A `Secure`
 * cookie is silently dropped by the browser over plain HTTP, which for a
 * login or a tracked visit looks identical to "nothing happened" - see the
 * longer note in next.config.ts.
 */
export const COOKIES_REQUIRE_HTTPS = false;
