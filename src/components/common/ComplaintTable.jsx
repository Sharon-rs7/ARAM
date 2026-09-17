import { Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import StatusBadge from '@/components/common/StatusBadge.jsx';
import { priorityTone, statusTone } from '@/utils/mappers.js';

export default function ComplaintTable({ complaints = [], detailsBasePath = '/dashboard/complaints' }) {
  const navigate = useNavigate();

  return (
    <div className="table-card">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Filed On</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {complaints.length === 0 && <tr><td colSpan="7">No complaints found.</td></tr>}
          {complaints.map((c) => (
            <tr key={c.id} onClick={() => navigate(`${detailsBasePath}/${c.id}`)} style={{ cursor: 'pointer' }}>
              <td data-label="ID">{c.code || c.id}</td>
              <td data-label="Title">{c.title}</td>
              <td data-label="Category">{c.category}</td>
              <td data-label="Priority"><StatusBadge type={priorityTone(c.priority)}>{c.priority}</StatusBadge></td>
              <td data-label="Status"><StatusBadge type={statusTone(c.status)}>{c.status}</StatusBadge></td>
              <td data-label="Filed On">{c.filedOn}</td>
              <td data-label="Action"><Link className="icon-link" to={`${detailsBasePath}/${c.id}`} onClick={(event) => event.stopPropagation()}><Eye size={16} /></Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
