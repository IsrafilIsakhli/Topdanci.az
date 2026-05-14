export function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[a-z]/.test(password) &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

export function passwordPolicyMessage(): string {
  return 'Password must be at least 8 characters and include uppercase, lowercase, and number characters';
}
