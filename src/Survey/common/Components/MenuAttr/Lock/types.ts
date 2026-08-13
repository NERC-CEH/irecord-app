import { BlockT } from 'common/flumens';

export type LockConfig = {
  /**
   * For custom locked value checks. Useful for aggregated attrs like number + ranges.
   */
  isLocked?: (props: {
    record: any;
    block: BlockT;
    survey: string;
    taxa?: string;
  }) => any;
  /**
   * For custom locked value getting. Useful for aggregated attrs like number + ranges.
   */
  get?: (props: {
    record: any;
    block: BlockT;
    survey: string;
    taxa?: string;
  }) => any;
  /**
   * For custom locked value unsetting. Useful for aggregated attrs like number + ranges.
   */
  set?: (props: {
    record: any;
    block: BlockT;
    survey: string;
    taxa?: string;
    value: any;
  }) => any;
  /**
   * For custom locked value removal. Useful for aggregated attrs like number + ranges.
   */
  unset?: (props: {
    record: any;
    block: BlockT;
    survey: string;
    taxa?: string;
  }) => any;
};
