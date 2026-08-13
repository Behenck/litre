/**
 * Restaura o conjunto de demonstração numa conta de teste.
 *
 * ATENÇÃO: apaga os veículos e abastecimentos dessa conta.
 *
 * A conta é criada já confirmada na primeira execução, para dar de onde entrar
 * sem depender de e-mail. Exige LITRO_DB_DRIVER=supabase — o driver SQLite não
 * guarda contas.
 *
 * Uso: npm run db:seed
 */
import { createUser, markVerified, type User } from '../src/domain/account/user';
import { getContainer } from '../src/infrastructure/container';

const EMAIL = process.env.LITRO_SEED_EMAIL ?? 'motorista@litro.app';
const PASSWORD = process.env.LITRO_SEED_PASSWORD ?? 'litro1234';
const CITY = process.env.LITRO_SEED_CITY ?? 'Curitiba';
const STATE = process.env.LITRO_SEED_STATE ?? 'PR';

async function demoUser(): Promise<User> {
  const { users, passwords } = getContainer();

  const existing = await users.findByEmail(EMAIL.toLowerCase());
  if (existing) return existing;

  const created = createUser({
    name: 'Motorista de exemplo',
    email: EMAIL,
    passwordHash: await passwords.hash(PASSWORD),
    city: CITY,
    state: STATE,
  });
  if (!created.ok) throw new Error(created.error.message);

  const verified = markVerified(created.value);
  await users.save(verified);

  return verified;
}

async function main(): Promise<void> {
  const user = await demoUser();
  await getContainer().seed.reset(user);

  console.log(`Dados de exemplo restaurados no driver ${process.env.LITRO_DB_DRIVER ?? 'sqlite'}.`);
  console.log(`Entre com ${user.email} / ${PASSWORD}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
