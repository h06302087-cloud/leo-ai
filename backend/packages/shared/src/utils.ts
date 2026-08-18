export function generateId(prefix = ''): string {
  return `${prefix}${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function sanitizeInput(input: string): string {
  return input.replace(/[<>]/g, '');
}

export function isValidCron(expression: string): boolean {
  const parts = expression.split(' ');
  return parts.length === 5;
}
