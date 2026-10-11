import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ContactFormDto } from './contact-form.dto';

const valid = {
  name: 'Priya',
  email: 'priya@example.com',
  topic: 'account',
  message: 'I cannot update my profile photo.',
};

describe('ContactFormDto', () => {
  it('accepts a valid message', async () => {
    expect(await validate(plainToInstance(ContactFormDto, valid))).toHaveLength(
      0,
    );
  });

  it.each([
    { email: 'nope' },
    { topic: 'spam' },
    { message: 'short' },
    { name: '' },
  ])('rejects %j', async (patch) => {
    const errors = await validate(
      plainToInstance(ContactFormDto, { ...valid, ...patch }),
    );
    expect(errors.length).toBeGreaterThan(0);
  });
});
