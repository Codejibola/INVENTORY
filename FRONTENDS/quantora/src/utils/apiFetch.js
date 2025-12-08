export default async function apiFetch(url, options = {}) {
  // opt-out behavior: callers can pass { autoRedirect: true } to retain
  // the old behaviour of immediately redirecting to the login page.
  const { autoRedirect = false, ...fetchOptions } = options;

  const token = localStorage.getItem("token");
  const headers = {
    ...fetchOptions.headers,
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(fetchOptions.body && { "Content-Type": "application/json" }),
  };

  const res = await fetch(url, { ...fetchOptions, headers });

  // Only treat as expired session if we *had* a token
  if ((res.status === 401 || res.status === 403) && token) {
    if (autoRedirect) {
      // legacy behaviour: alert + remove token + redirect
      alert("Your session has expired. Please log in again.");
      localStorage.removeItem("token");
      window.location.href = "/admin";
      return;
    }

    // New default: don't force a redirect. Dispatch an event so the UI
    // can decide how to handle session expiry (show modal, refresh token,
    // or redirect after user confirmation).
    try {
      window.dispatchEvent(new CustomEvent("session-expired", { detail: { url, status: res.status } }));
    } catch (e) {
      // ignore if CustomEvent isn't supported for some reason
      console.log(e)
    }

    // Return the response so callers can still inspect it and handle it
    // synchronously if they prefer.
    return res;
  }

  return res;
}

