import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateListingDto } from './create-listing.dto';

const VALID_LISTING = {
  brandName: 'Apple',
  productName: 'iPhone 12',
  partName: 'Screen',
  condition: 'Used - Good',
  price: 45.5,
};

describe('CreateListingDto', () => {
  it('accepts a minimal valid listing', async () => {
    const dto = plainToInstance(CreateListingDto, VALID_LISTING);
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
  });

  it('rejects an invalid condition', async () => {
    const dto = plainToInstance(CreateListingDto, {
      ...VALID_LISTING,
      condition: 'Brand New',
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'condition')).toBe(true);
  });

  it('rejects a negative price', async () => {
    const dto = plainToInstance(CreateListingDto, {
      ...VALID_LISTING,
      price: -5,
    });
    const errors = await validate(dto);
    expect(errors.some((e) => e.property === 'price')).toBe(true);
  });

  it('converts a numeric-string price into a number (query/form input)', async () => {
    const dto = plainToInstance(CreateListingDto, {
      ...VALID_LISTING,
      price: '45.50',
    });
    const errors = await validate(dto);
    expect(errors).toHaveLength(0);
    expect(dto.price).toBe(45.5);
  });
});
