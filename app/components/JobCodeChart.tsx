import React from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

interface Task {
    key: string;
    jobCode: string | null;
    taskUrl: string | null;
    duration: number | null;
    date: string | null;
}

interface JobCodeChartProps {
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



const COLORS = ['#003f5c', '#2f4b7c', '#665191', '#a05195', '#d45087', '#f95d6a', '#ff7c43', '#ffa600', '#00876c', '#66a182', '#a6ba73', '#dacc67', '#ffdd59', '#ffbc51', '#ff9a42', '#ff774c', '#ff5059'];
/*
const CustomLabel : React.FC<CustomLabelProps> = ({ x, y, fill, value, name }) => (
    <text x={x} y={y} fill={fill} textAnchor="middle" dominantBaseline="central">
      <tspan fontSize={12}>{`${name}: `}</tspan>
      <tspan fontSize={16} fontWeight="bold">{value}</tspan>
    </text>
);
*/






const JobCodeChart: React.FC<JobCodeChartProps> = ({ tasks, width = 160, height = 160, showLabels = false }) => {
    const jobCodeCounts = tasks.reduce((counts: { [key: string]: number }, task) => {
        if (task.jobCode) {
            counts[task.jobCode] = (counts[task.jobCode] || 0) + 1;
        }
        return counts;
    }, {});

    const data = Object.entries(jobCodeCounts).map(([jobCode, count]) => ({ name: jobCode, value: count }));
    const totalCount = Object.values(jobCodeCounts).reduce((total, count) => total + count, 0);

    const CustomLabel: React.FC<CustomLabelProps> = ({ x, y, fill, value, name }) => {
        const percent = (value / totalCount) * 100;

        return (
            <text x={x} y={y} fill={fill} textAnchor="middle" dominantBaseline="central">
                <tspan fontSize={12}>{name}</tspan>
                <tspan fontSize={16} fontWeight="bold" x={x} dy="1.2em">{`${percent.toFixed(0)}%`}</tspan>
            </text>
        );
    };

    return (
        <PieChart width={width} height={height}>
            <Pie
                dataKey="value"
                isAnimationActive={false}
                data={data}
                cx="50%"  
                cy="50%"
                labelLine={false}
                outerRadius="80%"
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

export default JobCodeChart;