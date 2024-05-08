import React, { useEffect, useState } from 'react';

interface TaskTypeFetcherProps {
  children: (taskType: string[]) => React.ReactNode;
}

const TaskTypeFetcher: React.FC<TaskTypeFetcherProps> = ({ children }) => {
  const [taskType, setTaskType] = useState<string[]>([]);

  useEffect(() => {
    // Fetch job codes from your API
    // This is just a placeholder, replace it with your actual API call
    const fetchTaskType = async () => {
      const response = await fetch('/api/taskstype');
      const data = await response.json();
      setTaskType(data);
    };

    fetchTaskType();
  }, []);

  return <>{children(taskType)}</>;
};

export default TaskTypeFetcher;