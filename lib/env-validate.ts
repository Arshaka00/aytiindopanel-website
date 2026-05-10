let validated = false;

export function validateRuntimeEnvOrThrow(): void {
  if (validated) return;
  const required = ["GALLERY_ADMIN_PASSWORD", "GALLERY_ADMIN_SESSION_SECRET"];
  const missing = required.filter((name) => !process.env[name]?.trim());
  if (missing.length > 0) {
    throw new Error(`Environment invalid. Missing variables: ${missing.join(", ")}`);
  }
  validated = true;
}
