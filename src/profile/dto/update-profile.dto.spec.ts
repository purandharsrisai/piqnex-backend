import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateProfileDto } from './update-profile.dto';

const check = (body: object) =>
  validate(plainToInstance(UpdateProfileDto, body));

describe('UpdateProfileDto bio and avatar', () => {
  it('accepts a bio, a small JPEG data URL, an https link, and an empty avatar (remove)', async () => {
    expect(await check({ bio: 'Repairs laptops.' })).toHaveLength(0);
    expect(
      await check({ avatarUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==' }),
    ).toHaveLength(0);
    expect(
      await check({ avatarUrl: 'https://example.com/me.jpg' }),
    ).toHaveLength(0);
    expect(await check({ avatarUrl: '' })).toHaveLength(0);
  });

  it.each([
    { bio: 'x'.repeat(201) },
    { avatarUrl: 'javascript:alert(1)' },
    { avatarUrl: 'data:text/html;base64,PHNjcmlwdD4=' },
    { avatarUrl: 'http://insecure.example.com/me.jpg' },
  ])('rejects %j', async (body) => {
    expect((await check(body)).length).toBeGreaterThan(0);
  });
});
