import { useEffect, useState } from "react";
import { getFiles, deleteFile } from "../../services/api";

export default function FileList({ token }) {
  const [files, setFiles] = useState([]);

  const fetchFiles = async () => {
    const data = await getFiles(token);
    if (data.success) setFiles(data.data);
  };

  const handleDelete = async (id) => {
    await deleteFile(id, token);
    fetchFiles();
  };

  useEffect(() => { fetchFiles(); }, []);

  return (
    <div>
      <h2>File List</h2>
      <ul>
        {files.map(f => (
          <li key={f._id}>
            {f.name} ({f.fileType}) - Owner: {f.owner?.email || 'N/A'}
            <button onClick={() => handleDelete(f._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
