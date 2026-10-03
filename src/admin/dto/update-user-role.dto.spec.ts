import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateUserRoleDto } from './update-user-role.dto';

describe('UpdateUserRoleDto', () => {
  it.each(['ADMIN', 'MODERATOR', 'NONE'])('accepts role = %s', async (role) => {
    const dto = plainToInstance(UpdateUserRoleDto, { role });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects an unrecognized role', async () => {
    const dto = plainToInstance(UpdateUserRoleDto, { role: 'SUPERUSER' });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'role')).toBe(true);
  });

  it('rejects a missing role', async () => {
    const dto = plainToInstance(UpdateUserRoleDto, {});
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'role')).toBe(true);
  });
});
