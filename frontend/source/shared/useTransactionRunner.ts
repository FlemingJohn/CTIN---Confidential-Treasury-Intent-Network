'use client';

import { useToast } from '@/source/notifications/useToast';
import { friendlyError } from '@/source/shared/friendlyError';

export const sepoliaTransactionUrl = (hash: string) =>
  `https://sepolia.etherscan.io/tx/${hash}`;

interface RunOptions<T> {
  pending: string;
  success: string;
  action: () => Promise<T>;
  linkFromResult?: (result: T) => string | undefined;
}

export function useTransactionRunner() {
  const toast = useToast();

  const run = async <T>({ pending, success, action, linkFromResult }: RunOptions<T>): Promise<T> => {
    const id = toast.show({ variant: 'pending', message: pending });
    try {
      const result = await action();
      toast.update(id, {
        variant: 'success',
        message: success,
        href: linkFromResult ? linkFromResult(result) : undefined,
      });
      return result;
    } catch (error) {
      toast.update(id, { variant: 'error', message: friendlyError(error) });
      throw error;
    }
  };

  return { run };
}
