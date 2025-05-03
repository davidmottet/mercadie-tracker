import React, { useState } from 'react';

interface TargetEditorProps {
  initialValue: number;
  onSave: (value: number) => void;
  onCancel: () => void;
}

const TargetEditor: React.FC<TargetEditorProps> = ({
  initialValue,
  onSave,
  onCancel
}) => {
  const [targetValue, setTargetValue] = useState(initialValue);

  const handleTargetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setTargetValue(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(targetValue);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <div className="flex items-center space-x-2">
        <input
          type="number"
          value={targetValue}
          onChange={handleTargetChange}
          className="w-20 px-2 py-1 border rounded"
          step="0.1"
          min="0"
        />
        <button
          type="submit"
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          OK
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
        >
          Annuler
        </button>
      </div>
    </form>
  );
};

export default TargetEditor; 