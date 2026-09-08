import type { BlockT } from 'common/flumens';

type LockProps = {
  record: Record<string, unknown>;
  block: BlockT;
  survey: string;
  taxa?: string;
};

export type LockConfig = {
  /** Custom check for aggregated locked values. */
  isLocked?: (props: LockProps) => boolean;
  /** Custom getter for aggregated locked values. */
  get?: (props: LockProps) => unknown;
  /** Custom setter for aggregated locked values. */
  set?: (props: LockProps & { value: unknown }) => void;
  /** Custom removal for aggregated locked values. */
  unset?: (props: LockProps) => void;
};
