export function Slider({ label, value, onChange, min = 0, max = 10, description }) {
  const getColor = (val) => {
    const ratio = val / max;
    if (ratio <= 0.3) return 'text-dark-success';
    if (ratio <= 0.6) return 'text-yellow-500';
    return 'text-dark-alert';
  };

  return (
    <div className="p-4 bg-dark-surface rounded-xl">
      <div className="flex justify-between items-center mb-3">
        <div className="flex-1">
          <p className="font-medium text-gray-100">{label}</p>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <span className={`text-2xl font-bold ${getColor(value)}`}>
          {value}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer touch-manipulation"
        style={{
          background: `linear-gradient(to right, #10B981 0%, #10B981 ${(value / max) * 100}%, #374151 ${(value / max) * 100}%, #374151 100%)`,
        }}
      />
      <div className="flex justify-between text-xs text-gray-500 mt-2">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
