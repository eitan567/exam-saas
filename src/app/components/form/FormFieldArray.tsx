import React from 'react';
import Button from '../Button';
import Card from '../Card';

interface FormFieldArrayProps<T> {
  name: string;
  label?: string;
  helper?: string;
  error?: string;
  value: T[];
  onChange: (value: T[]) => void;
  renderItem: (props: {
    index: number;
    value: T;
    onChange: (value: T) => void;
    onRemove: () => void;
    isLast: boolean;
  }) => React.ReactNode;
  addLabel?: string;
  emptyState?: React.ReactNode;
  maxItems?: number;
  minItems?: number;
  createNewItem: () => T;
  className?: string;
}

function FormFieldArray<T>({
  name,
  label,
  helper,
  error,
  value,
  onChange,
  renderItem,
  addLabel = 'Add Item',
  emptyState,
  maxItems,
  minItems = 0,
  createNewItem,
  className = '',
}: FormFieldArrayProps<T>) {
  const handleAdd = () => {
    if (maxItems && value.length >= maxItems) return;
    onChange([...value, createNewItem()]);
  };

  const handleRemove = (index: number) => {
    if (value.length <= minItems) return;
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  const handleChange = (index: number, itemValue: T) => {
    const newValue = [...value];
    newValue[index] = itemValue;
    onChange(newValue);
  };

  return (
    <div className={className}>
      {label && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {label}
          </h3>
          {(!maxItems || value.length < maxItems) && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAdd}
            >
              {addLabel}
            </Button>
          )}
        </div>
      )}

      <div className="space-y-4">
        {value.length === 0 && emptyState ? (
          <Card className="text-center py-8">
            {emptyState}
            <Button
              type="button"
              variant="primary"
              className="mt-4"
              onClick={handleAdd}
            >
              {addLabel}
            </Button>
          </Card>
        ) : (
          value.map((item, index) => (
            <div key={`${name}-${index}`} className="relative">
              {renderItem({
                index,
                value: item,
                onChange: (newValue) => handleChange(index, newValue),
                onRemove: () => handleRemove(index),
                isLast: index === value.length - 1,
              })}
            </div>
          ))
        )}
      </div>

      {(helper || error) && (
        <p
          className={`mt-2 text-sm ${
            error ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {error || helper}
        </p>
      )}

      {!label && (!maxItems || value.length < maxItems) && (
        <Button
          type="button"
          variant="secondary"
          className="mt-4"
          onClick={handleAdd}
        >
          {addLabel}
        </Button>
      )}
    </div>
  );
}

// Example usage:
// interface Question {
//   text: string;
//   options: string[];
// }
//
// const ExamForm = () => {
//   const [questions, setQuestions] = React.useState<Question[]>([]);
//
//   return (
//     <FormFieldArray
//       name="questions"
//       label="Questions"
//       value={questions}
//       onChange={setQuestions}
//       addLabel="Add Question"
//       minItems={1}
//       maxItems={10}
//       createNewItem={() => ({ text: '', options: [] })}
//       emptyState={
//         <p>No questions added yet. Click below to add your first question.</p>
//       }
//       renderItem={({ index, value, onChange, onRemove }) => (
//         <Card>
//           <FormGroup label={`Question ${index + 1}`}>
//             <FormInput
//               value={value.text}
//               onChange={(e) => onChange({ ...value, text: e.target.value })}
//             />
//           </FormGroup>
//           <FormFieldArray
//             name={`questions.${index}.options`}
//             label="Options"
//             value={value.options}
//             onChange={(options) => onChange({ ...value, options })}
//             addLabel="Add Option"
//             minItems={2}
//             maxItems={4}
//             createNewItem={() => ''}
//             renderItem={({ value: optionValue, onChange: onOptionChange }) => (
//               <FormInput
//                 value={optionValue}
//                 onChange={(e) => onOptionChange(e.target.value)}
//               />
//             )}
//           />
//           <Button variant="danger" onClick={onRemove}>
//             Remove Question
//           </Button>
//         </Card>
//       )}
//     />
//   );
// };

export default FormFieldArray;