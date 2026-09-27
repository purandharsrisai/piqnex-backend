import { IsIn } from 'class-validator';
import { LISTING_STATUSES } from '../listing.constants';
import type { ListingStatus } from '../listing.constants';

export class UpdateListingStatusDto {
  @IsIn(LISTING_STATUSES)
  status!: ListingStatus;
}
