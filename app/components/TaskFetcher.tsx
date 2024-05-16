// TaskFetcher.tsx
import React, { useEffect, useState } from 'react';
import { Skeleton } from 'antd';

interface Task {
    key: string;
    jobCode: string | null;
    taskUrl: string;
    duration: number | null;
    date: string | null;
    taskType: string | null;
    taskStatus: string | null;
    taskStatusPath: string | null;
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
            try {
            const response = await fetch('/api/tasks');
            if (!response.ok) {
                throw new Error('Network response was not ok');
              }
            const data = await response.json();

            if (!data.jobCodes) {
                throw new Error('Job codes are missing from the data');
              }

            const tasks = data.jobCodes.map((jobCode: string, index: number) => ({
                key: String(index),
                jobCode: jobCode,
                taskUrl: data.taskUrls[index],
                duration: Number(data.durations[index]),
                date: data.date[index],
                taskType : data.taskType[index],
                taskStatus : data.taskStatus[index] ? data.taskStatus[index].split(";").pop() : null,
                taskStatusPath: data.taskStatus[index],
                
            }));
        //    console.log('taskStatus:', tasks[0].taskStatus);
            
            setTasks(tasks);
            setIsLoading(false);
        } catch (error) {
            console.error('There was an error fetching data from Google Sheets:', error);}
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