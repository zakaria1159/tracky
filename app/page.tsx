"use client";
import React, { useEffect, useState } from 'react';
import JobCodeFetcher from './components/JobCodeFetcher';
import TaskFetcher from './components/TaskFetcher';

import { Button, Input, Row, Col, Card, Select, Table, Skeleton, Tooltip } from 'antd';
interface Task {
  key: string;
  jobCode: string | null;
  taskUrl: string | null;
  duration: number | null;
}

const Page = () => {
  const [selectedJobCode, setSelectedJobCode] = useState<string | null | undefined>(null);
  const [taskUrl, setTaskUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [taskToResume, setTaskToResume] = useState<Task | null>(null);

  const [startTime, setStartTime] = useState<number | null>(null);
  const sendDataToGoogleSheets = async (jobCode: string | null, duration: number | null, taskUrl: string | null) => {
    //     if (jobCode && duration) {
      console.log('Sending data to Google Sheets:', { jobCode, duration, taskUrl });
    try {
      const response = await fetch('/api/sendtosheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobCode, taskUrl, duration }),
      });

      if (!response.ok) {
        throw new Error('Failed to send data to Google Sheets');
      }

      alert('Data sent to Google Sheets successfully');
    } catch (error) {
      console.error(error);
    }
  }
  const columns = [
    {
      title: 'Job Code',
      dataIndex: 'jobCode',
      key: 'jobCode',
    },
    {
      title: 'Task URL',
      dataIndex: 'taskUrl',
      key: 'taskUrl',
      width: '30%', // Set the width of the Task URL column to 30%
      render: (text: string | null) => (
        <Tooltip title={text}>
          <a href={text || ''}>
            {text && text.length > 20 ? text.substring(0, 20) + '...' : text}
          </a>
        </Tooltip>
      ),
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration: number | null) => {
        if (duration === null) {
          return null;
        }

        const minutes = Math.floor(duration / 60000);
        const seconds = ((duration % 60000) / 1000).toFixed(0);
        return minutes + ":" + (Number(seconds) < 10 ? '0' : '') + seconds;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: string, record: Task) => (
        <Button onClick={() => {
          if (record.jobCode && record.taskUrl) {
            handleResume(record.jobCode, record.taskUrl);
          }
        }}>Resume</Button>
      ),
    },
  ];

  const handleResume = (jobCode: string, url: string) => {
    const start = Date.now();
    setIsRunning(true);
    setStartTime(start);
    setSelectedJobCode(jobCode);
    setTaskUrl(url);
  };
  
  useEffect(() => {
    if (isRunning) {
      localStorage.setItem('isRunning', 'true');
      localStorage.setItem('startTime', startTime !== null ? startTime.toString() : 'default value');
      localStorage.setItem('jobCode', selectedJobCode || '');
      localStorage.setItem('taskUrl', taskUrl || '');
    }
  }, [isRunning, startTime, selectedJobCode, taskUrl]);

  const handleStart = () => {
    const start = Date.now();
    setStartTime(start);
    setIsRunning(true);
    localStorage.setItem('isRunning', 'true');
    localStorage.setItem('startTime', start.toString());
    localStorage.setItem('jobCode', selectedJobCode || '');
    localStorage.setItem('taskUrl', taskUrl || '');
  };


  const handleStop = async () => {
    const storedStartTime = localStorage.getItem('startTime');
    const storedJobCode = localStorage.getItem('jobCode');
    const storedTaskUrl = localStorage.getItem('taskUrl');

    console.log('Stored values:', { storedStartTime, storedJobCode, storedTaskUrl });
  
    if (storedStartTime !== null && storedJobCode && storedTaskUrl) {
      const duration = Date.now() - Number(storedStartTime);
      await sendDataToGoogleSheets(storedJobCode, duration, storedTaskUrl);
      setFetchTrigger(fetchTrigger + 1);
      setIsRunning(false);
      setSelectedJobCode(''); 
      setTaskUrl('');
      localStorage.removeItem('isRunning');
      localStorage.removeItem('startTime');
      localStorage.removeItem('jobCode');
      localStorage.removeItem('taskUrl');
    }
  };

  useEffect(() => {
    const storedIsRunning = localStorage.getItem('isRunning');
    const storedStartTime = localStorage.getItem('startTime');
    const storedJobCode = localStorage.getItem('jobCode');
    const storedTaskUrl = localStorage.getItem('taskUrl');
  
    if (storedIsRunning) {
      setIsRunning(true);
    }
  
    if (storedStartTime) {
      setStartTime(Number(storedStartTime));
    }
  
    if (storedJobCode) {
      setSelectedJobCode(storedJobCode);
    }
  
    if (storedTaskUrl) {
      setTaskUrl(storedTaskUrl);
    }
  }, []);

  useEffect(() => {
    
    // Simulate a loading delay
    setTimeout(() => {
      setIsLoading(false); // Set isLoading to false after the components have loaded
    }, 2000); // Change this to your actual loading time
  }, []);

  return (
    isLoading ? (
      <Skeleton active /> // Display the Skeleton component when isLoading is true
    ) : (
      <Row gutter={16}>
        <Col span={8}>
          <Card title="Task Info" style={{ minHeight: '300px' }}>
            <JobCodeFetcher>
              {(jobCodes) => (
                <Select
                  style={{ width: '100%' }} // Set the width to 100%
                  placeholder="Select a job code" // Add a placeholder
                  onChange={code => setSelectedJobCode(code)}
                  value={selectedJobCode}
                  disabled={isRunning}
                >
                  {jobCodes.map(code => (
                    <Select.Option key={code} value={code}>
                      {code}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </JobCodeFetcher>
            <Input placeholder="Task URL" value={taskUrl || ''} onChange={e => setTaskUrl(e.target.value)} style={{ margin: '10px 0' }} disabled={isRunning}/>
            <Button type="primary" onClick={handleStart} disabled={isRunning} style={{ marginRight: '10px' }}>Start</Button>
            <Button danger type="primary" onClick={handleStop} disabled={!isRunning}>Stop</Button>
          </Card>
        </Col>
        <Col span={16}>
          <Card title="Dashboard" style={{ minHeight: '300px' }}>
            <h2>Tasks</h2>
            <div>
              <TaskFetcher trigger={fetchTrigger}>
                {(tasks, isLoading) => (
                  isLoading ? (
                    <Skeleton active />
                  ) : (
                    <Table key={fetchTrigger} dataSource={tasks} columns={columns} />
                  )
                )}
              </TaskFetcher>
            </div>
          </Card>
        </Col>
      </Row>
    )
  );
};

export default Page;