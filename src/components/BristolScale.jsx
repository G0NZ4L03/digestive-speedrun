export function BristolScale({ value, onChange }) {
  const bristolTypes = [
    { value: 1, label: 'Tipo 1', desc: 'Bolos duros separados' },
    { value: 2, label: 'Tipo 2', desc: 'Salsicha pero grumosa' },
    { value: 3, label: 'Tipo 3', desc: 'Salsicha con grietas' },
    { value: 4, label: 'Tipo 4', desc: 'Salsicha suave lisa' },
    { value: 5, label: 'Tipo 5', desc: 'Blandos con bordes' },
    { value: 6, label: 'Tipo 6', desc: 'Trozos blandos' },
    { value: 7, label: 'Tipo 7', desc: 'Líquido sin sólidos' },
  ];

  return (
    <div className="p-4 bg-dark-surface rounded-xl">
      <p className="font-medium text-gray-100 mb-3">Escala de Bristol</p>
      <div className="grid grid-cols-2 gap-2">
        {bristolTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => onChange(type.value)}
            className={`p-3 rounded-lg text-left touch-manipulation active:scale-[0.98] transition-transform ${
              value === type.value
                ? 'bg-dark-success text-white'
                : 'bg-gray-800 text-gray-400'
            }`}
          >
            <p className="font-medium text-sm">{type.label}</p>
            <p className="text-xs mt-1 opacity-80">{type.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
