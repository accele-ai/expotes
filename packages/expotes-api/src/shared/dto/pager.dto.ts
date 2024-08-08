import { tags } from 'typia';

interface BasePagerDto {
  size?: number & tags.Default<25>;
}

export interface PagerDto extends BasePagerDto {
  page?: number & tags.Default<1>;
}

export interface CursorPagerDto<TCursor = string> extends BasePagerDto {
  cursor?: TCursor;
}
