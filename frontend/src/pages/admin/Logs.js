import React from 'react';
import { FileText, Clock, AlertCircle, CheckCircle, XCircle, Info } from 'lucide-react';

const AdminLogs = () => {
  // Sample logs data for demonstration
  const logs = [
    { id: 1, type: 'info', action: 'User Login', user: 'admin@example.com', time: '2024-03-13 10:30 AM', details: 'Admin logged in successfully' },
    { id: 2, type: 'success', action: 'Student Created', user: 'admin@example.com', time: '2024-03-13 09:15 AM', details: 'New student Rahul added' },
    { id: 3, type: 'warning', action: 'Failed Login', user: 'unknown', time: '2024-03-13 08:45 AM', details: 'Multiple failed login attempts' },
    { id: 4, type: 'error', action: 'Database Error', user: 'system', time: '2024-03-12 11:20 PM', details: 'Connection timeout' },
  ];

  const getIcon = (type) => {
    switch(type) {
      case 'info': return <Info size={16} />;
      case 'success': return <CheckCircle size={16} />;
      case 'warning': return <AlertCircle size={16} />;
      case 'error': return <XCircle size={16} />;
      default: return <FileText size={16} />;
    }
  };

  return (
    <div className="logs-container">
      <div className="logs-header">
        <h1>
          <FileText size={28} />
          System Logs
        </h1>
        <p className="header-subtitle">View and monitor system activity</p>
      </div>

      <div className="logs-stats">
        <div className="stat-card">
          <Clock size={20} />
          <div>
            <span className="stat-label">Total Logs</span>
            <span className="stat-value">1,234</span>
          </div>
        </div>
        <div className="stat-card">
          <AlertCircle size={20} />
          <div>
            <span className="stat-label">Warnings</span>
            <span className="stat-value">23</span>
          </div>
        </div>
        <div className="stat-card">
          <XCircle size={20} />
          <div>
            <span className="stat-label">Errors</span>
            <span className="stat-value">5</span>
          </div>
        </div>
      </div>

      <div className="logs-table-wrapper">
        <table className="logs-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Action</th>
              <th>User</th>
              <th>Time</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className={`log-row log-${log.type}`}>
                <td>
                  <span className={`log-badge ${log.type}`}>
                    {getIcon(log.type)}
                    {log.type}
                  </span>
                </td>
                <td>{log.action}</td>
                <td>{log.user}</td>
                <td>{log.time}</td>
                <td>{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminLogs;