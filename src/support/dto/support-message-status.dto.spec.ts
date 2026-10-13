import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import {
  SupportMessagesQueryDto,
  UpdateSupportMessageStatusDto,
} from './support-message-status.dto';

describe('support message status DTOs', () => {
  it('accepts new and handled, rejects anything else', async () => {
    for (const status of ['new', 'handled']) {
      const dto = plainToInstance(UpdateSupportMessageStatusDto, { status });
      expect(await validate(dto)).toHaveLength(0);
    }
    const bad = plainToInstance(UpdateSupportMessageStatusDto, {
      status: 'archived',
    });
    expect((await validate(bad)).length).toBeGreaterThan(0);
  });

  it('list query takes an optional page and status', async () => {
    const ok = plainToInstance(SupportMessagesQueryDto, {
      page: '2',
      status: 'new',
    });
    expect(await validate(ok)).toHaveLength(0);
    expect(ok.page).toBe(2);
    expect(
      await validate(plainToInstance(SupportMessagesQueryDto, {})),
    ).toHaveLength(0);
    const bad = plainToInstance(SupportMessagesQueryDto, { status: 'x' });
    expect((await validate(bad)).length).toBeGreaterThan(0);
  });
});
