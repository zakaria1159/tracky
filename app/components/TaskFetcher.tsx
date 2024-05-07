// TaskFetcher.tsx
import React, { useEffect, useState } from 'react';
import { Skeleton } from 'antd';

interface Task {
    key: string;
    jobCode: string | null;
    taskUrl: string;
    duration: number | null;
    date: string | null;
}

interface TaskFetcherProps {
    trigger: number;
    children: (tasks: Task[], isLoading: boolean) => React.ReactNode;
}

const TaskFetcher: React.FC<TaskFetcherProps> = ({ children, trigger }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDataFromGoogleSheets = async () => {
            const response = await fetch('/api/tasks');
            const data = await response.json();

            const tasks = data.jobCodes.map((jobCode: string, index: number) => ({
                key: String(index),
                jobCode: jobCode,
                taskUrl: data.taskUrls[index],
                duration: Number(data.durations[index]),
                date: data.date[index]
            }));

            setTasks(tasks);
            setIsLoading(false);
        };

        fetchDataFromGoogleSheets();
    }, [trigger]);

    return <>
        {isLoading ? (
            <Skeleton active /> // Display the Skeleton component when isLoading is true
        ) : (
            children(tasks, isLoading)
        )}
    </>
};

export default TaskFetcher;