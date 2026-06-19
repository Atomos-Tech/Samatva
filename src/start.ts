import { createStart, createMiddleware, createCsrfMiddleware } from "@tanstack/react-start";
import { renderErrorPage } from "./lib/error-page";

/**
 * Global error boundary middleware — catches unhandled server-side throws
 * that escape individual route handlers and converts them to a clean 500
 * error page instead of leaking raw stack traces to the client.
 */
const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    // Re-throw structured HTTP errors (e.g. 404 NotFound) so TanStack
    // can handle them correctly. Only catch truly unhandled errors.
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error("[Samatva] Unhandled server error:", error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

/**
 * CSRF protection middleware — verifies that server function requests
 * originate from the same origin, blocking cross-site request forgery.
 * Applied only to serverFn calls (not regular page navigations).
 */
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  requestMiddleware: [csrfMiddleware, errorMiddleware],
}));
