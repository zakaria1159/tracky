import React from 'react';
import { Treemap, Tooltip } from 'recharts';

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
    fontSize: number; // Add this line
}

interface CustomContentProps {
    x: number;
    y: number;
    width: number;
    height: number;
    index: number;
    payload: any;
    name: string;
    colors: string[];
    fontSize: number;
}

interface TooltipProps {
    active?: boolean;
    payload?: any;
    label?: string;
}

const COLORS = ['#003f5c', '#2f4b7c', '#665191', '#a05195', '#d45087', '#f95d6a', '#ff7c43', '#ffa600', '#00876c', '#66a182', '#a6ba73', '#dacc67', '#ffdd59', '#ffbc51', '#ff9a42', '#ff774c', '#ff5059'];

const CustomContent: React.FC<CustomContentProps> = ({ x, y, width, height, index, payload, colors, name, fontSize }) => {
    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: colors[index % colors.length],
                    stroke: '#fff',
                    strokeWidth: 3,
                    opacity: 0.8,
                }}
            />
            <text
                x={x + width / 2}
                y={y + height / 2}
                textAnchor="middle"
                fill="#fff"
                fontSize={fontSize}
                style={{
                    position: 'absolute',
                    width: 100,
                }}
            >
                 {name}
            </text>
        </g>
    );
};

const JobCodeChart: React.FC<JobCodeChartProps> = ({ tasks, width = 200, height = 200, fontSize }) => {
    const jobCodeCounts = tasks.reduce((counts: { [key: string]: number }, task) => {
        if (task.jobCode) {
            counts[task.jobCode] = (counts[task.jobCode] || 0) + 1;
        }
        return counts;
    }, {});
    
    console.log("Job Code Counts:", jobCodeCounts); 
    const data = Object.entries(jobCodeCounts).map(([jobCode, count]) => ({ name: jobCode, value: count }));
    const CustomContentWrapper: React.FC<any> = (props) => <CustomContent {...props} colors={COLORS} fontSize={fontSize} />

    return (
        <Treemap
            width={width}
            height={height}
            data={data}
            dataKey="value"
            stroke="#fff"
            nameKey="name"
            fill="#8884d8"
            content={<CustomContentWrapper/> }
        >
             <Tooltip  />
        </Treemap>
    );
};

export default JobCodeChart;