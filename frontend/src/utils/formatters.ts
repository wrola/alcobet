export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateShort = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = date.getTime() - now.getTime();
  const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays < 0) {
    return `${Math.abs(diffInDays)} days ago`;
  } else if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Tomorrow';
  } else {
    return `${diffInDays} days left`;
  }
};

export const calculateProgress = (createdAt: string, deadline: string): { currentDay: number; totalDays: number; percentage: number } => {
  const start = new Date(createdAt);
  const end = new Date(deadline);
  const now = new Date();

  const totalMs = end.getTime() - start.getTime();
  const elapsedMs = now.getTime() - start.getTime();

  const totalDays = Math.ceil(totalMs / (1000 * 60 * 60 * 24));
  const currentDay = Math.min(Math.ceil(elapsedMs / (1000 * 60 * 60 * 24)), totalDays);
  const percentage = Math.max(0, Math.min(100, (currentDay / totalDays) * 100));

  return { currentDay: Math.max(1, currentDay), totalDays, percentage };
};

export const getBetStatusColor = (status: 'active' | 'completed' | 'failed'): string => {
  switch (status) {
    case 'active':
      return 'text-blue-600 bg-blue-100';
    case 'completed':
      return 'text-green-600 bg-green-100';
    case 'failed':
      return 'text-red-600 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const getBetStatusBadgeColor = (status: 'active' | 'completed' | 'failed'): string => {
  switch (status) {
    case 'active':
      return 'blue';
    case 'completed':
      return 'green';
    case 'failed':
      return 'red';
    default:
      return 'gray';
  }
};

export const getBetStatusText = (status: 'active' | 'completed' | 'failed'): string => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    default:
      return 'Unknown';
  }
};