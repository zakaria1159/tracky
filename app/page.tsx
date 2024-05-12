"use client";
import React, { useEffect, useState, useRef } from 'react';
import JobCodeFetcher from './components/JobCodeFetcher';
import TaskFetcher from './components/TaskFetcher';

import { Button, Input, Row, Col, Card, Select, Table, Skeleton, Tooltip, Spin, Modal, Space, InputRef, TableColumnsType, TableColumnType } from 'antd';
import AverageDurationCard from './components/AverageDurationCard';
import JobCodeChart from './components/JobCodeChart';
import { SearchOutlined } from '@ant-design/icons';
import TaskTypeFetcher from './components/TaskTypeFetcher';
import TaskTypeChart from './components/TaskTypeChart';
import Highlighter from "react-highlight-words";
import TaskStatusChart from './components/TaskStatusChart';



interface Task {
  key: string;
  jobCode: string | null;
  taskUrl: string | null;
  duration: number | null;
  date: string | null;
  taskType: string | null;
  taskStatus: string | null;

}

type DataIndex = keyof Task;

interface FilterDropdownProps {
  setSelectedKeys: (keys: any[]) => void;
  selectedKeys: any[];
  confirm: () => void;
  clearFilters?: () => void; // Make clearFilters optional
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
  const [isTaskTypeModalVisible, setIsTaskTypeModalVisible] = useState(false);
  const [isTaskStatusModalVisible, setIsTaskStatusModalVisible] = useState(false);
  const [sortedInfo, setSortedInfo] = React.useState<{ order?: 'descend' | 'ascend', columnKey?: string }>({});


  const [searchText, setSearchText] = useState('');
  const [searchedColumn, setSearchedColumn] = useState('');
  const searchInput = useRef<InputRef>(null);

  const handleSearch = (
    selectedKeys: string[],
    confirm: FilterDropdownProps['confirm'],
    dataIndex: DataIndex,
  ) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters: () => void) => {
    clearFilters();
    setSearchText('');

  };

  const getColumnSearchProps = (dataIndex: DataIndex): TableColumnType<Task> => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
      <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
          style={{ marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys as string[], confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
          </Button>

          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (value, record) => {
      let recordValue = record[dataIndex!];
      if (recordValue === null || record[dataIndex] === null) {
        return false; // or whatever you want to do when dataIndex or record[dataIndex] is null
      }

      return recordValue
        .toString()
        .toLowerCase()
        .includes((value as string).toLowerCase());
    },
    onFilterDropdownOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
    render: (text) =>
      searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
          searchWords={[searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });





  const handleChange = (pagination: any, filters: any, sorter: any) => {
    setSortedInfo(sorter);
  };

  const [startTime, setStartTime] = useState<number | null>(null);
  const sendDataToGoogleSheets = async (jobCode: string | null, taskUrl: string | null, duration: number | null, date: string | null, taskType: string | null)  => {
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
      width: '5%',

      ...getColumnSearchProps('jobCode'),
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
      width: '20%',
      ...getColumnSearchProps('taskUrl'),
      render: (text: string | null) => (
        <Tooltip title={text}>
          <a href={text || ''} style={{ fontSize: '12px' }}>
            {text && text.length > 25 ? text.substring(28, 42) + '...' : text}
          </a>
        </Tooltip>
      ),
     
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',

      sorter: (a: any, b: any) => a.duration - b.duration,
      sortOrder: sortedInfo.columnKey === 'duration' ? sortedInfo.order : null,

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
      sorter: (a: any, b: any) => a.date - b.date,
      sortOrder: sortedInfo.columnKey === 'date' ? sortedInfo.order : null,

    },
    {
      title: 'Status',
      dataIndex: 'taskStatus',
      key: 'taskStatus',

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
  //  const storedTaskStatus = localStorage.getItem('taskStatus');

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
                            <JobCodeChart tasks={tasks} fontSize={5} />
                          </div>
                          <Modal
                            title="Job Code Chart"
                            visible={isModalVisible}
                            onOk={() => setIsModalVisible(false)}
                            onCancel={() => setIsModalVisible(false)}
                            width={720}
                          >
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                              <JobCodeChart tasks={tasks} width={400} height={400} fontSize={12} />
                            </div>
                          </Modal>
                        </Card>

                      </Col>
                      <Col xs={24} sm={24} md={12} lg={12} xl={6} style={{ marginBottom: '20px', display: 'flex' }}>
                        <Card
                          title="Tasks per Types"
                          style={{ width: '100%' }}
                          extra={
                            <Button shape="circle" icon={<SearchOutlined />} onClick={() => setIsTaskTypeModalVisible(true)}>

                            </Button>
                          }
                        >
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <TaskTypeChart tasks={tasks} />
                          </div>
                          <Modal
                            title="Task per types"
                            visible={isTaskTypeModalVisible}
                            onOk={() => setIsTaskTypeModalVisible(false)}
                            onCancel={() => setIsTaskTypeModalVisible(false)}
                            width={720}
                          >
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                              <TaskTypeChart tasks={tasks} width={550} height={450} showLabels={true} />
                            </div>
                          </Modal>
                        </Card>

                      </Col>
                      <Col xs={24} sm={24} md={12} lg={12} xl={6} style={{ marginBottom: '20px', display: 'flex' }}>
                        <Card
                          title="Tasks per Status"
                          style={{ width: '100%' }}
                          extra={
                            <Button shape="circle" icon={<SearchOutlined />} onClick={() => setIsTaskStatusModalVisible(true)}>

                            </Button>
                          }
                        >
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <TaskStatusChart tasks={tasks} />
                          </div>
                          <Modal
                            title="Task per Status"
                            visible={isTaskStatusModalVisible}
                            onOk={() => setIsTaskStatusModalVisible(false)}
                            onCancel={() => setIsTaskStatusModalVisible(false)}
                            width={720}
                          >
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                              <TaskStatusChart tasks={tasks} width={550} height={450} showLabels={true} />
                            </div>
                          </Modal>
                        </Card>

                      </Col>
                    </Row>
                    {isLoading ? (
                      <Skeleton active />
                    ) : (
                      <Row>
                        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
                          <Space
                            style={{
                              marginBottom: 16,
                            }}
                          >


                          </Space>
                          <Table key={fetchTrigger} dataSource={tasks} onChange={handleChange} columns={columns} size="small" pagination={{ pageSize: 6 }} style={{ fontSize: '0.8em' }} scroll={{ x: 'max-content' }} />
                        </Col>
                      </Row>
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