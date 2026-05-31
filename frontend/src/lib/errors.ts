// Pull a useful message out of an Axios error or a regular Error.
export function getErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "response" in err) {
    const data = (
      err as { response?: { data?: { message?: string; error?: string } } }
    ).response?.data;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
