import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ListBrandsQueryDto } from './list-brands-query.dto';

describe('ListBrandsQueryDto', () => {
  it('allows an omitted category (list every brand)', async () => {
    const dto = plainToInstance(ListBrandsQueryDto, {});
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('allows a valid slug', async () => {
    const dto = plainToInstance(ListBrandsQueryDto, { category: 'mobiles' });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('allows a hyphenated multi-word slug', async () => {
    const dto = plainToInstance(ListBrandsQueryDto, {
      category: 'home-appliances',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a slug with spaces or capitals', async () => {
    const dto = plainToInstance(ListBrandsQueryDto, {
      category: 'Home Appliances',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'category')).toBe(true);
  });
});
