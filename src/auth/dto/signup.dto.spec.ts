import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SignupDto } from './signup.dto';

describe('SignupDto', () => {
  it('accepts a valid signup payload', async () => {
    const dto = plainToInstance(SignupDto, {
      email: 'seller@example.com',
      password: 'correct-horse-battery-staple',
      displayName: 'Priya',
    });

    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid email', async () => {
    const dto = plainToInstance(SignupDto, {
      email: 'not-an-email',
      password: 'correct-horse-battery-staple',
      displayName: 'Priya',
    });

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'email')).toBe(true);
  });

  it('rejects a password shorter than 8 characters', async () => {
    const dto = plainToInstance(SignupDto, {
      email: 'seller@example.com',
      password: 'short',
      displayName: 'Priya',
    });

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'password')).toBe(true);
  });

  it('rejects an empty display name', async () => {
    const dto = plainToInstance(SignupDto, {
      email: 'seller@example.com',
      password: 'correct-horse-battery-staple',
      displayName: '',
    });

    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'displayName')).toBe(true);
  });
});
