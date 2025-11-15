import { useEffect, useState } from "react";
import { getFileStatus } from "../../services/api";

export default function FileStatus({ token }) {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      const data = await getFileStatus(token);
      if (data.success) setStatus(data.data);
    };
    fetchStatus();
  }, []);

  if (!status) return <p>Loading...</p>;

  return (
    <div>
      <h2>File Status</h2>
      <p>Total Files: {status.totalFiles}</p>
      <p>Public Files: {status.publicFiles}</p>
      <p>Private Files: {status.privateFiles}</p>
      <ul>
        {status.byType.map(b => <li key={b.fileType}>{b.fileType}: {b.count}</li>)}
      </ul>
    </div>
  );
}
