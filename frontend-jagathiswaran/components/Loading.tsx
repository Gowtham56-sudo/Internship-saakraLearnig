import React from 'react';

export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizes = {
    sm: 'h-6 w-6 border-2',
    md: 'h-12 w-12 border-3',
    lg: 'h-16 w-16 border-4',
  };

  return (
    <div className={`inline-block animate-spin rounded-full border-slate-300 border-t-indigo-600 ${sizes[size]}`} />
  );
};

export const SkeletonLoader: React.FC<{ count?: number; height?: string }> = ({
  count = 3,
  height = '20px',
}) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-slate-200 rounded-lg animate-pulse"
          style={{ height }}
        />
      ))}
    </div>
  );
};

export const LoadingCard: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
      <div className="bg-slate-200 h-6 w-1/3 rounded-lg animate-pulse" />
      <div className="bg-slate-200 h-4 w-full rounded-lg animate-pulse" />
      <div className="bg-slate-200 h-4 w-5/6 rounded-lg animate-pulse" />
      <div className="flex gap-4">
        <div className="bg-slate-200 h-8 w-1/2 rounded-lg animate-pulse" />
        <div className="bg-slate-200 h-8 w-1/2 rounded-lg animate-pulse" />
      </div>
    </div>
  );
};

export const EmptyState: React.FC<{
  icon?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}> = ({ icon = '📭', title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2 text-center">{title}</h3>
      <p className="text-slate-600 text-center mb-6 max-w-sm">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-semibold"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

interface PageStateProps {
  state: 'loading' | 'empty' | 'error';
  title: string;
  message: string;
  icon?: string;
  retry?: () => void;
}

export const PageState: React.FC<PageStateProps> = ({ state, title, message, icon, retry }) => {
  if (state === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-slate-600">{message}</p>
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
        <div className="text-5xl mb-4">{icon || '⚠️'}</div>
        <h2 className="text-xl font-bold text-red-900 mb-2">{title}</h2>
        <p className="text-red-700 mb-6">{message}</p>
        {retry && (
          <button
            onClick={retry}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  return (
    <EmptyState
      icon={icon || '📭'}
      title={title}
      description={message}
    />
  );
};
