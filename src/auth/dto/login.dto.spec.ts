import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  it('accepts a valid login payload', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'seller@example.com',
      password: 'anything',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a missing password', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'seller@example.com',
      password: '',
    });

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('rejects an invalid email', async () => {
    const dto = plainToInstance(LoginDto, {
      email: 'nope',
      password: 'anything',
    });

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });
});
