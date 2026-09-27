import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateCategoryDto } from './create-category.dto';

describe('CreateCategoryDto', () => {
  it('accepts a valid category', async () => {
    const dto = plainToInstance(CreateCategoryDto, {
      slug: 'mobiles',
      name: 'Mobiles',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects a slug with uppercase letters', async () => {
    const dto = plainToInstance(CreateCategoryDto, {
      slug: 'Mobiles',
      name: 'Mobiles',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'slug')).toBe(true);
  });
});
