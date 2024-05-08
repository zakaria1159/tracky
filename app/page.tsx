"use client";
import React, { useEffect, useState } from 'react';
import JobCodeFetcher from './components/JobCodeFetcher';
import TaskFetcher from './components/TaskFetcher';

import { Button, Input, Row, Col, Card, Select, Table, Skeleton, Tooltip, Spin, Modal } from 'antd';
import AverageDurationCard from './components/AverageDurationCard';
import JobCodeChart from './components/JobCodeChart';
import { SearchOutlined } from '@ant-design/icons';
import TaskTypeFetcher from './components/TaskTypeFetcher';


interface Task {
  key: string;
  jobCode: string | null;
  taskUrl: string | null;
  duration: number | null;
  date: string | null;
  taskType: string | null;

}

const Page = () => {
  const [selectedJobCode, setSelectedJobCode] = useState<string | null | undefined>(null);
  const [taskUrl, setTaskUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [taskToResume, setTaskToResume] = useState<Task | null>(null);
  const [date, setDate] = useState<string>(new Date().toLocaleDateString('en-GB'));
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedTaskType, setSelectedTaskType] = useState<string | null | undefined>(null);

  const [startTime, setStartTime] = useState<number | null>(null);
  const sendDataToGoogleSheets = async (jobCode: string | null, taskUrl: string | null, duration: number | null, date: string | null, taskType: string | null) => {
    //     if (jobCode && duration) {
    console.log('Sending data to Google Sheets:', { jobCode, duration, taskUrl, date, taskType });
    try {
      const response = await fetch('/api/sendtosheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobCode, taskUrl, duration, date, taskType }),
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
      title: 'Type',
      dataIndex: 'taskType',
      key: 'tasktType',
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
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Action',
      key: 'action',
      render: (text: string, record: Task) => (
        <Button onClick={() => {
          if (record.jobCode && record.taskUrl) {
            handleResume(record.jobCode, record.taskUrl, record.taskType || '');
          }
        }}>Resume</Button>
      ),
    },
  ];

  const handleResume = (jobCode: string, url: string, taskType: string) => {
    const start = Date.now();
    setIsRunning(true);
    setStartTime(start);
    setSelectedJobCode(jobCode);
    setTaskUrl(url);
    setDate(new Date().toLocaleDateString('en-GB'));
    setSelectedTaskType(taskType);
  };

  useEffect(() => {
    if (isRunning) {
      localStorage.setItem('isRunning', 'true');
      localStorage.setItem('startTime', startTime !== null ? startTime.toString() : 'default value');
      localStorage.setItem('jobCode', selectedJobCode || '');
      localStorage.setItem('taskUrl', taskUrl || '');
      localStorage.setItem('date', date);
      localStorage.setItem('taskType', selectedTaskType || '');
    }
  }, [isRunning, startTime, selectedJobCode, taskUrl, date, selectedTaskType]);

  const handleStart = () => {
    const start = Date.now();
    setStartTime(start);
    setIsRunning(true);
    localStorage.setItem('isRunning', 'true');
    localStorage.setItem('startTime', start.toString());
    localStorage.setItem('jobCode', selectedJobCode || '');
    localStorage.setItem('taskUrl', taskUrl || '');
    setDate(new Date().toLocaleDateString('en-GB'));
    localStorage.setItem('taskType', selectedTaskType || '');
  };


  const handleStop = async () => {
    const storedStartTime = localStorage.getItem('startTime');
    const storedJobCode = localStorage.getItem('jobCode');
    const storedTaskUrl = localStorage.getItem('taskUrl');
    const storedDate = localStorage.getItem('date');
    const storedTaskType = localStorage.getItem('taskType');

    console.log('Stored values:', { storedStartTime, storedJobCode, storedTaskUrl });

    if (storedStartTime !== null && storedJobCode && storedTaskUrl) {
      const duration = Date.now() - Number(storedStartTime);
      await sendDataToGoogleSheets(storedJobCode, storedTaskUrl, duration, storedDate, storedTaskType);
      setFetchTrigger(fetchTrigger + 1);
      setIsRunning(false);
      setSelectedJobCode('');
      setTaskUrl('');
      setSelectedTaskType('');
      localStorage.removeItem('isRunning');
      localStorage.removeItem('startTime');
      localStorage.removeItem('jobCode');
      localStorage.removeItem('taskUrl');
      localStorage.removeItem('date');
      localStorage.removeItem('taskType');
    }
  };

  useEffect(() => {
    const storedIsRunning = localStorage.getItem('isRunning');
    const storedStartTime = localStorage.getItem('startTime');
    const storedJobCode = localStorage.getItem('jobCode');
    const storedTaskUrl = localStorage.getItem('taskUrl');
    const storedTaskType = localStorage.getItem('taskType');

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

    if (storedTaskType) {
      setSelectedTaskType(storedTaskType);
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
        <Col xs={24} sm={24} md={8} lg={6} xl={6}>
          <Card title="Task Info" style={{ minHeight: '300px' }}>
            <label htmlFor="jobCodeSelect">Job Code</label>
            <JobCodeFetcher>
              {(jobCodes) => (
                <Select
                  style={{ width: '100%' }} // Set the width to 100%
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
            <label htmlFor="jobCodeSelect">TaskType</label>
            <TaskTypeFetcher>
              {(taskType) => (
                <Select
                  style={{ width: '100%' }} // Set the width to 100%
                  onChange={code => setSelectedTaskType(code)}
                  value={selectedTaskType}
                  disabled={isRunning}
                >
                  {taskType.map(code => (
                    <Select.Option key={code} value={code}>
                      {code}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </TaskTypeFetcher>
            <label htmlFor="taskUrlInput" style={{ marginTop: '10px' }}>Task URL</label>
            <Input id="taskUrlInput" value={taskUrl || ''} onChange={e => setTaskUrl(e.target.value)} style={{ margin: '10px 0' }} disabled={isRunning} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
              <Button size="large" type="primary" onClick={handleStart} disabled={isRunning} style={{ marginRight: '10px' }}>Start</Button>
              <Button danger size="large" type="primary" onClick={handleStop} disabled={!isRunning}>Stop</Button>
            </div>
            {isRunning && (
              <div className="mt-4 flex items-center justify-center">
                <Spin size="large" /> {/* This is the larger spinner */}
                <p className="text-lg text-blue-500 ml-4">Task in progress</p> {/* This is the styled text */}
              </div>
            )}
          </Card>
        </Col>
        <Col xs={24} sm={24} md={16} lg={18} xl={18}>

          <Card title="Dashboard" style={{ minHeight: '300px' }}>
            <div>
              <TaskFetcher trigger={fetchTrigger}>
                {(tasks, isLoading) => (
                  <>
                    <Row gutter={16} style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch' }}>
                      <Col xs={24} sm={24} md={12} lg={12} xl={6} style={{ marginBottom: '20px', display: 'flex' }}>
                        <AverageDurationCard tasks={tasks} />
                      </Col>
                      <Col xs={24} sm={24} md={12} lg={12} xl={6} style={{ marginBottom: '20px', display: 'flex' }}>
                        <Card
                          title="Tasks per JobCode"
                          style={{ width: '100%' }}
                          extra={
                            <Button shape="circle" icon={<SearchOutlined />} onClick={() => setIsModalVisible(true)}>

                            </Button>
                          }
                        >
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                          <JobCodeChart tasks={tasks} />
                          </div>
                          <Modal
                            title="Job Code Chart"
                            visible={isModalVisible}
                            onOk={() => setIsModalVisible(false)}
                            onCancel={() => setIsModalVisible(false)}
                            width={720}
                          >
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                              <JobCodeChart tasks={tasks} width={400} height={400} showLabels={true} />
                            </div>
                          </Modal>
                        </Card>
                        
                      </Col>
                      <Col xs={24} sm={24} md={12} lg={12} xl={6} style={{ marginBottom: '20px', display: 'flex' }}>
                        <Card
                          title="Tasks per JobCode"
                          style={{ width: '100%' }}
                          extra={
                            <Button shape="circle" icon={<SearchOutlined />} onClick={() => setIsModalVisible(true)}>

                            </Button>
                          }
                        >
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                          <JobCodeChart tasks={tasks} />
                          </div>
                          <Modal
                            title="Job Code Chart"
                            visible={isModalVisible}
                            onOk={() => setIsModalVisible(false)}
                            onCancel={() => setIsModalVisible(false)}
                            width={720}
                          >
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                              <JobCodeChart tasks={tasks} width={400} height={400} showLabels={true} />
                            </div>
                          </Modal>
                        </Card>
                        
                      </Col>
                    </Row>
                    {isLoading ? (
                      <Skeleton active />
                    ) : (
                      <Col xs={24} sm={24} md={12} lg={24} xl={24}>
                        <Table key={fetchTrigger} dataSource={tasks} columns={columns} size="small" pagination={{ pageSize: 6 }} />
                      </Col>
                    )}
                  </>
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