import React, { useEffect, useState } from 'react';

interface JobCodeFetcherProps {
  children: (jobCodes: string[]) => React.ReactNode;
}

const JobCodeFetcher: React.FC<JobCodeFetcherProps> = ({ children }) => {
  const [jobCodes, setJobCodes] = useState<string[]>([]);

  useEffect(() => {
    // Fetch job codes from your API
    // This is just a placeholder, replace it with your actual API call
    const fetchJobCodes = async () => {
      const response = await fetch('/api/jobcodes');
      const data = await response.json();
      setJobCodes(data);
    };

    fetchJobCodes();
  }, []);

  return <>{children(jobCodes)}</>;
};

export default JobCodeFetcher;