import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import moment from 'moment';

interface Task {
    key: string;
    jobCode: string | null;
    taskUrl: string | null;
    duration: number | null;
    date: string | null;
    taskType: string | null;
    taskStatus: string | null;
    taskStatusPath: string | null;
}

interface TaskCountChartProps {
    tasks: Task[];
    width?: number;
    height?: number;
    showLabels?: boolean;
}

const TasksCountChart: React.FC<TaskCountChartProps> = ({ tasks, width = 300, height = 200, showLabels = false}) => {
    const taskWeekCounts = tasks.reduce((counts: { [key: string]: number }, task) => {
        if (task.date) {
            const week = moment(task.date, "DD/MM/YY").week();
            counts[week] = (counts[week] || 0) + 1;
        }
        return counts;
    }, {});

    const data = Object.entries(taskWeekCounts).map(([week, count]) => ({ week: `W${week}`, count }));

    return (
        <BarChart width={width} height={height} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis tickFormatter={(value) => Math.round(value).toString()} />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
        </BarChart>
    );
};

export default TasksCountChart;