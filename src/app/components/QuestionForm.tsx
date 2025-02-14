import React from 'react';

interface QuestionFormProps {
  index: number;
  onDelete?: () => void;
}

const QuestionForm: React.FC<QuestionFormProps> = ({ index, onDelete }) => {
  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Question {index + 1}
        </h3>
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
          >
            Remove
          </button>
        )}
      </div>

      <div>
        <label htmlFor={`question-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Question Text
        </label>
        <textarea
          id={`question-${index}`}
          name={`questions[${index}].text`}
          rows={2}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          placeholder="Enter your question"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Options
        </label>
        {[0, 1, 2, 3].map((optionIndex) => (
          <div key={optionIndex} className="flex items-center space-x-2">
            <input
              type="radio"
              name={`questions[${index}].correctAnswer`}
              value={optionIndex}
              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-600"
            />
            <input
              type="text"
              name={`questions[${index}].options[${optionIndex}]`}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
              placeholder={`Option ${optionIndex + 1}`}
            />
          </div>
        ))}
      </div>

      <div>
        <label htmlFor={`explanation-${index}`} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Explanation (Optional)
        </label>
        <textarea
          id={`explanation-${index}`}
          name={`questions[${index}].explanation`}
          rows={2}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
          placeholder="Explain the correct answer"
        />
      </div>
    </div>
  );
};

export default QuestionForm;