type error = {
  message: string;
  status: number;
  response: string | any;
  request: string | any;
  config: string | any;
};

export function useError(error: error, action: string): string {
  return error.status === 401
    ? `You're unauthorized to ${action}, Log in to continue.`
    : error.status === 403
      ? `You're unauthorized to ${action}.`
      : error.status === 404
        ? 'Endpoint not found. Seek support from the Dev team.'
        : error.status === 405
          ? 'There was an error! Seek suport from the Dev team.'
          : ` Failed to ${action}.`;
}
