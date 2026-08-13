import type { EmailVerification } from '@/domain/account/email-verification';
import type { PasswordReset } from '@/domain/account/password-reset';
import type { Role } from '@/domain/account/role';
import type { Session } from '@/domain/account/session';
import type { User } from '@/domain/account/user';
import type { Tables } from './database.types';

type UserRow = Tables<'users'>;
type SessionRow = Tables<'sessions'>;
type EmailVerificationRow = Tables<'email_verifications'>;
type PasswordResetRow = Tables<'password_resets'>;

export function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    city: row.city,
    state: row.state,
    regionKey: row.region_key,
    emailVerifiedAt: row.email_verified_at,
    role: row.role as Role,
    createdAt: row.created_at,
  };
}

export function userToRow(user: User): UserRow {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    password_hash: user.passwordHash,
    city: user.city,
    state: user.state,
    region_key: user.regionKey,
    email_verified_at: user.emailVerifiedAt,
    role: user.role,
    created_at: user.createdAt,
  };
}

export function rowToSession(row: SessionRow): Session {
  return {
    id: row.id,
    userId: row.user_id,
    tokenHash: row.token_hash,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

export function sessionToRow(session: Session): SessionRow {
  return {
    id: session.id,
    user_id: session.userId,
    token_hash: session.tokenHash,
    expires_at: session.expiresAt,
    created_at: session.createdAt,
  };
}

export function rowToVerification(row: EmailVerificationRow): EmailVerification {
  return {
    tokenHash: row.token_hash,
    userId: row.user_id,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

export function verificationToRow(verification: EmailVerification): EmailVerificationRow {
  return {
    token_hash: verification.tokenHash,
    user_id: verification.userId,
    expires_at: verification.expiresAt,
    created_at: verification.createdAt,
  };
}

export function rowToPasswordReset(row: PasswordResetRow): PasswordReset {
  return {
    tokenHash: row.token_hash,
    userId: row.user_id,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

export function passwordResetToRow(reset: PasswordReset): PasswordResetRow {
  return {
    token_hash: reset.tokenHash,
    user_id: reset.userId,
    expires_at: reset.expiresAt,
    created_at: reset.createdAt,
  };
}
