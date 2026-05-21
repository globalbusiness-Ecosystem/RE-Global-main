import { toast } from '@/hooks/use-toast';

export const showErrorToast = (message: string = 'Something went wrong, please try again') => {
  toast({
    title: 'Error',
    description: message,
    variant: 'destructive',
    duration: 3000,
  });
};

export const handleAsyncError = async <T>(
  fn: () => Promise<T>,
  errorMessage?: string
): Promise<T | null> => {
  try {
    return await fn();
  } catch (error) {
    console.error('Async error:', error);
    showErrorToast(errorMessage || 'Something went wrong, please try again');
    return null;
  }
};

export const handleSyncError = <T>(
  fn: () => T,
  errorMessage?: string
): T | null => {
  try {
    return fn();
  } catch (error) {
    console.error('Sync error:', error);
    showErrorToast(errorMessage || 'Something went wrong, please try again');
    return null;
  }
};
