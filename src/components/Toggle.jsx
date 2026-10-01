import { Check, X } from 'lucide-react';

export function Toggle({ label, value, onChange, description }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="w-full flex items-center justify-between p-4 bg-dark-surface rounded-xl touch-manipulation active:scale-[0.98] transition-transform"
    >
      <div className="flex-1 text-left">
        <p className="font-medium text-gray-100">{label}</p>
        {description && (
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        )}
      </div>
      <div
        className={`w-12 h-7 rounded-full flex items-center justify-center transition-colors ${
          value ? 'bg-dark-success' : 'bg-gray-700'
        }`}
      >
        {value ? (
          <Check className="w-5 h-5 text-white" />
        ) : (
          <X className="w-5 h-5 text-gray-400" />
        )}
      </div>
    </button>
  );
}
