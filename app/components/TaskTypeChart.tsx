import React from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

interface Task {
    key: string;
    jobCode: string | null;
    taskUrl: string | null;
    duration: number | null;
    date: string | null;
    taskType: string | null;
}

interface TaskTypeChartProps {
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

const COLORS = ['#FF8042', '#00C49F', '#FFBB28', '#FF8042'];
const CustomLabel : React.FC<CustomLabelProps> = ({ x, y, fill, value, name }) => (
    <text x={x} y={y} fill={fill} fontSize={12} textAnchor="middle" dominantBaseline="central">
      {`${name}: ${value}`}
    </text>
  );

const TaskTypeChart: React.FC<TaskTypeChartProps> = ({ tasks, width = 160, height = 160, showLabels = false}) => {
    const taskTypeCounts = tasks.reduce((counts: { [key: string]: number }, task) => {
    if (task.taskType) {
        counts[task.taskType] = (counts[task.taskType] || 0) + 1;
    }
    return counts;
}, {});

    const data = Object.entries(taskTypeCounts).map(([taskType, count]) => ({ name: taskType, value: count }));
    

    return (
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
    );
};

export default TaskTypeChart;