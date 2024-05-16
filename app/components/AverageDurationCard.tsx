import { Card } from 'antd';
import React from 'react';

interface Task {
  key: string;
  jobCode: string | null;
  taskUrl: string | null;
  duration: number | null;
  date: string | null;
}

interface AverageDurationCardProps {
  tasks: Task[];
}

const AverageDurationCard: React.FC<AverageDurationCardProps> = ({ tasks }) => {

  const averageDurationMilliseconds = tasks.length > 0
    ? tasks.reduce((total, task) => total + (Number(task.duration) || 0), 0) / tasks.length
    : 0;

  const averageDurationSeconds = averageDurationMilliseconds / 1000;

  const hours = Math.floor(averageDurationSeconds / 3600);
  const minutes = Math.floor((averageDurationSeconds % 3600) / 60);
  const seconds = Math.floor(averageDurationSeconds % 60);

  const hoursStr = String(hours).padStart(2, '0');
  const minutesStr = String(minutes).padStart(2, '0');
  const secondsStr = String(seconds).padStart(2, '0');


  return (
    <Card title="Av. Duration" style={{ textAlign: 'center', fontSize: '24px', width: '100%' }}>
      {isNaN(averageDurationSeconds) ? 'No tasks yet' : `${hoursStr}:${minutesStr}:${secondsStr}`}
    </Card>
  );
};

export default AverageDurationCard;