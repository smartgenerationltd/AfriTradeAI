import { UserProfile } from '../types';

/**
 * Validates whether an AfriTrade AI user profile meets all mandatory identification
 * and onboarding criteria per platform requirements.
 *
 * Requirements for a complete profile:
 * 1. user object exists
 * 2. fullName exists and is not blank
 * 3. email exists and is not blank
 * 4. phone exists and is not blank
 * 5. country exists and is not blank
 * 6. city exists and is not blank
 * 7. role exists ('buyer', 'seller', or 'admin')
 * 8. profileCompleted is explicitly true
 */
export function isProfileComplete(user: UserProfile | null | undefined): boolean {
  if (!user) return false;

  const hasFullName = typeof user.fullName === 'string' && user.fullName.trim().length > 0;
  const hasEmail = typeof user.email === 'string' && user.email.trim().length > 0;
  const hasPhone = typeof user.phone === 'string' && user.phone.trim().length > 0;
  const hasCountry = typeof user.country === 'string' && user.country.trim().length > 0;
  const hasCity = typeof user.city === 'string' && user.city.trim().length > 0;
  const hasRole = Boolean(
    user.role && (user.role === 'buyer' || user.role === 'seller' || user.role === 'admin')
  );
  const isMarkedCompleted = user.profileCompleted === true;

  return Boolean(
    hasFullName &&
    hasEmail &&
    hasPhone &&
    hasCountry &&
    hasCity &&
    hasRole &&
    isMarkedCompleted
  );
}

/**
 * Returns a list of missing profile field names for user feedback.
 */
export function getMissingProfileFields(user: UserProfile | null | undefined): string[] {
  if (!user) {
    return ['fullName', 'email', 'phone', 'country', 'city', 'role'];
  }

  const missing: string[] = [];
  if (!user.fullName || !user.fullName.trim()) missing.push('Full Name');
  if (!user.email || !user.email.trim()) missing.push('Email Address');
  if (!user.phone || !user.phone.trim()) missing.push('Phone Number');
  if (!user.country || !user.country.trim()) missing.push('Country');
  if (!user.city || !user.city.trim()) missing.push('City');
  if (!user.role || !['buyer', 'seller', 'admin'].includes(user.role)) missing.push('Account Type');

  return missing;
}
