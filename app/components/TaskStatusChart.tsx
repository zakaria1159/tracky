import React from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

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

interface TaskStatusChartProps {
    tasks: Task[];
    width?: number;
    height?: number;
    showLabels?: boolean;
}
interface CustomLabelProps {
    x: number;
    y: number;
    fill: string;
    value: number;
    name: string;
}

const COLORS = ['#FF4500', '#0088FE', '#FFBB28', '#FF8042'];
const CustomLabel: React.FC<CustomLabelProps> = ({ x, y, fill, value, name }) => (
    <text x={x} y={y} fill={fill} fontSize={12} textAnchor="middle" dominantBaseline="central">
        {`${name}: ${value}`}
    </text>
);

const TaskStatusChart: React.FC<TaskStatusChartProps> = ({ tasks, width = 160, height = 160, showLabels = false }) => {

    const taskStatusCounts = tasks.reduce((counts: { [key: string]: number }, task) => {
        if (task.taskStatusPath && task.taskType === 'Curation') {
            const statuses = task.taskStatusPath.split(';');
            const revisionCount = statuses.filter(status => status.trim() === 'Revision').length;
            const approvedCount = statuses.filter(status => status.trim() === 'Approved').length;
            counts['Revision'] = (counts['Revision'] || 0) + revisionCount;
            counts['Approved'] = (counts['Approved'] || 0) + approvedCount;
        }
        return counts;
    }, {});
    
    const data = Object.entries(taskStatusCounts).map(([taskStatus, count]) => ({ name: taskStatus, value: count }));

    const revisionsCount = taskStatusCounts['Revision'] || 0;
    const approvedCount = taskStatusCounts['Approved'] || 0;
    // Replace 'revision' with the actual task status for revisions
    const revisionRate = approvedCount > 0 ? (revisionsCount / approvedCount) * 100 : 0;

    return (
        <div>
            <PieChart width={width} height={height}>
                <Pie
                    dataKey="value"
                    isAnimationActive={false}
                    data={data}
                    cx="50%"
                    cy="50%"
                    outerRadius="90%"
                    fill="#8884d8"
                    label={showLabels ? CustomLabel : undefined}
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
            </PieChart>
            <div style={{ textAlign: 'center', marginTop: '10px', fontWeight: 'bold', color: '#FF4500' }}>
                {`Revision Rate: ${revisionRate.toFixed(2)}%`}
            </div>
        </div>

    );
};

export default TaskStatusChart;