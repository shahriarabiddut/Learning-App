const FormLoadingSpinner = () => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-xl max-w-md w-full mx-4">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Loading form...
        </p>
      </div>
    </div>
  </div>
);
export default FormLoadingSpinner;
