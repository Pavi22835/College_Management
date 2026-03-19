import React, { useState } from 'react';
import { 
  DollarSign, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Plus, 
  Edit, 
  Trash2,
  Download,
  Printer,
  CreditCard,
  FileText,
  Users,
  Calendar,
  X,
  Save
} from 'lucide-react';
import './FeeManagement.css';

const FeeManagement = () => {
  const [activeTab, setActiveTab] = useState('fee-structure');
  const [feeStructures, setFeeStructures] = useState([
    {
      id: 1,
      semester: 'Semester 1',
      course: 'B.Sc Computer Science',
      tuitionFee: 50000,
      registrationFee: 5000,
      labFee: 10000,
      libraryFee: 2000,
      total: 67000
    },
    {
      id: 2,
      semester: 'Semester 1',
      course: 'B.Sc Mathematics',
      tuitionFee: 40000,
      registrationFee: 5000,
      labFee: 5000,
      libraryFee: 2000,
      total: 52000
    }
  ]);

  const [feePayments, setFeePayments] = useState([
    {
      id: 1,
      studentName: 'Rahul Kumar',
      rollNo: 'STU001',
      semester: 'Semester 1',
      dueAmount: 67000,
      paidAmount: 67000,
      status: 'Paid',
      paymentDate: '2024-06-15',
      paymentMethod: 'Online'
    },
    {
      id: 2,
      studentName: 'Priya Singh',
      rollNo: 'STU002',
      semester: 'Semester 1',
      dueAmount: 52000,
      paidAmount: 26000,
      status: 'Partial',
      paymentDate: '2024-06-20',
      paymentMethod: 'Cheque'
    },
    {
      id: 3,
      studentName: 'Amit Patel',
      rollNo: 'STU003',
      semester: 'Semester 1',
      dueAmount: 67000,
      paidAmount: 0,
      status: 'Pending',
      paymentDate: null,
      paymentMethod: null
    }
  ]);

  const [showFeeModal, setShowFeeModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingFeeId, setEditingFeeId] = useState(null);
  const [feeForm, setFeeForm] = useState({
    semester: '',
    course: '',
    tuitionFee: '',
    registrationFee: '',
    labFee: '',
    libraryFee: ''
  });

  const [paymentForm, setPaymentForm] = useState({
    studentName: '',
    rollNo: '',
    semester: '',
    paidAmount: '',
    paymentMethod: 'Online'
  });

  const handleAddFeeStructure = () => {
    if (feeForm.semester && feeForm.course && feeForm.tuitionFee) {
      const total = 
        (parseFloat(feeForm.tuitionFee) || 0) +
        (parseFloat(feeForm.registrationFee) || 0) +
        (parseFloat(feeForm.labFee) || 0) +
        (parseFloat(feeForm.libraryFee) || 0);

      if (editingFeeId) {
        setFeeStructures(feeStructures.map(f =>
          f.id === editingFeeId
            ? { ...feeForm, id: editingFeeId, total }
            : f
        ));
        setEditingFeeId(null);
      } else {
        setFeeStructures([...feeStructures, {
          id: Date.now(),
          ...feeForm,
          total
        }]);
      }

      setFeeForm({
        semester: '',
        course: '',
        tuitionFee: '',
        registrationFee: '',
        labFee: '',
        libraryFee: ''
      });
      setShowFeeModal(false);
    }
  };

  const handleEditFee = (fee) => {
    setFeeForm({
      semester: fee.semester,
      course: fee.course,
      tuitionFee: fee.tuitionFee.toString(),
      registrationFee: fee.registrationFee.toString(),
      labFee: fee.labFee.toString(),
      libraryFee: fee.libraryFee.toString()
    });
    setEditingFeeId(fee.id);
    setShowFeeModal(true);
  };

  const handleDeleteFee = (id) => {
    if (window.confirm('Are you sure you want to delete this fee structure?')) {
      setFeeStructures(feeStructures.filter(f => f.id !== id));
    }
  };

  const handleRecordPayment = () => {
    if (paymentForm.studentName && paymentForm.paidAmount) {
      setFeePayments([...feePayments, {
        id: Date.now(),
        ...paymentForm,
        status: 'Paid',
        paymentDate: new Date().toISOString().split('T')[0]
      }]);
      setPaymentForm({
        studentName: '',
        rollNo: '',
        semester: '',
        paidAmount: '',
        paymentMethod: 'Online'
      });
      setShowPaymentModal(false);
    }
  };

  const getPaymentStats = () => {
    const stats = {
      totalDue: 0,
      totalPaid: 0,
      partialPayments: 0,
      pendingPayments: 0
    };

    feePayments.forEach(payment => {
      stats.totalDue += payment.dueAmount;
      stats.totalPaid += payment.paidAmount;
      if (payment.status === 'Partial') stats.partialPayments++;
      if (payment.status === 'Pending') stats.pendingPayments++;
    });

    return stats;
  };

  const stats = getPaymentStats();
  const defaultReceiptNumber = `RCP${Date.now()}`;

  return (
    <div className="fee-management-container">
      <div className="fee-header">
        <h1>
          <DollarSign size={28} />
          Fee Management
        </h1>
      </div>

      {/* Fee Statistics */}
      <div className="fee-stats">
        <div className="stat-card">
          <DollarSign className="stat-icon" size={24} />
          <div className="stat-info">
            <div className="stat-label">Total Due</div>
            <div className="stat-value">₹{stats.totalDue.toLocaleString()}</div>
          </div>
        </div>
        <div className="stat-card">
          <CheckCircle className="stat-icon" size={24} />
          <div className="stat-info">
            <div className="stat-label">Total Collected</div>
            <div className="stat-value">₹{stats.totalPaid.toLocaleString()}</div>
          </div>
        </div>
        <div className="stat-card">
          <Clock className="stat-icon" size={24} />
          <div className="stat-info">
            <div className="stat-label">Partial Payments</div>
            <div className="stat-value">{stats.partialPayments}</div>
          </div>
        </div>
        <div className="stat-card">
          <XCircle className="stat-icon" size={24} />
          <div className="stat-info">
            <div className="stat-label">Pending</div>
            <div className="stat-value">{stats.pendingPayments}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="fee-tabs">
        <button
          className={`tab ${activeTab === 'fee-structure' ? 'active' : ''}`}
          onClick={() => setActiveTab('fee-structure')}
        >
          <FileText size={16} />
          Fee Structure
        </button>
        <button
          className={`tab ${activeTab === 'payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('payments')}
        >
          <CreditCard size={16} />
          Fee Payments
        </button>
      </div>

      {/* Content */}
      <div className="fee-content">
        {activeTab === 'fee-structure' && (
          <div className="fee-structure-section">
            <div className="section-header">
              <h2>Fee Structure Setup</h2>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setEditingFeeId(null);
                  setFeeForm({
                    semester: '',
                    course: '',
                    tuitionFee: '',
                    registrationFee: '',
                    labFee: '',
                    libraryFee: ''
                  });
                  setShowFeeModal(true);
                }}
              >
                <Plus size={16} />
                Add Fee Structure
              </button>
            </div>

            <div className="fees-grid">
              {feeStructures.map((fee) => (
                <div key={fee.id} className="fee-card">
                  <div className="fee-card-header">
                    <h3>{fee.course}</h3>
                    <span className="badge">{fee.semester}</span>
                  </div>
                  <div className="fee-breakdown">
                    <div className="fee-item">
                      <span className="fee-label">Tuition Fee:</span>
                      <span className="fee-amount">₹{fee.tuitionFee.toLocaleString()}</span>
                    </div>
                    <div className="fee-item">
                      <span className="fee-label">Registration Fee:</span>
                      <span className="fee-amount">₹{fee.registrationFee.toLocaleString()}</span>
                    </div>
                    <div className="fee-item">
                      <span className="fee-label">Lab Fee:</span>
                      <span className="fee-amount">₹{fee.labFee.toLocaleString()}</span>
                    </div>
                    <div className="fee-item">
                      <span className="fee-label">Library Fee:</span>
                      <span className="fee-amount">₹{fee.libraryFee.toLocaleString()}</span>
                    </div>
                    <div className="fee-item total">
                      <span className="fee-label">Total:</span>
                      <span className="fee-amount">₹{fee.total.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="fee-actions">
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => handleEditFee(fee)}
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteFee(fee.id)}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="fee-payments-section">
            <div className="section-header">
              <h2>Fee Payments & Records</h2>
              <button
                className="btn btn-primary"
                onClick={() => setShowPaymentModal(true)}
              >
                <Plus size={16} />
                Record Payment
              </button>
            </div>

            <div className="table-wrapper">
              <table className="payments-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Roll No</th>
                    <th>Semester</th>
                    <th>Due Amount</th>
                    <th>Paid Amount</th>
                    <th>Status</th>
                    <th>Payment Method</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {feePayments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{payment.studentName}</td>
                      <td>{payment.rollNo}</td>
                      <td>{payment.semester}</td>
                      <td>₹{payment.dueAmount.toLocaleString()}</td>
                      <td>₹{payment.paidAmount.toLocaleString()}</td>
                      <td>
                        <span className={`status-badge status-${payment.status.toLowerCase()}`}>
                          {payment.status === 'Paid' && <CheckCircle size={12} />}
                          {payment.status === 'Partial' && <Clock size={12} />}
                          {payment.status === 'Pending' && <XCircle size={12} />}
                          {payment.status}
                        </span>
                      </td>
                      <td>{payment.paymentMethod || 'N/A'}</td>
                      <td>{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <button className="btn btn-info btn-sm">
                          <Printer size={14} />
                          Receipt
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Fee Structure Modal */}
      {showFeeModal && (
        <div className="modal-overlay" onClick={() => setShowFeeModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingFeeId ? 'Edit Fee Structure' : 'Add Fee Structure'}</h2>
              <button className="close-btn" onClick={() => setShowFeeModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Semester *</label>
                  <select
                    value={feeForm.semester}
                    onChange={(e) => setFeeForm({ ...feeForm, semester: e.target.value })}
                    className="form-control"
                  >
                    <option value="">Select Semester</option>
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                    <option value="Semester 3">Semester 3</option>
                    <option value="Semester 4">Semester 4</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Course *</label>
                  <input
                    type="text"
                    placeholder="e.g., B.Sc Computer Science"
                    value={feeForm.course}
                    onChange={(e) => setFeeForm({ ...feeForm, course: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Tuition Fee *</label>
                  <input
                    type="number"
                    placeholder="50000"
                    value={feeForm.tuitionFee}
                    onChange={(e) => setFeeForm({ ...feeForm, tuitionFee: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Registration Fee</label>
                  <input
                    type="number"
                    placeholder="5000"
                    value={feeForm.registrationFee}
                    onChange={(e) => setFeeForm({ ...feeForm, registrationFee: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Lab Fee</label>
                  <input
                    type="number"
                    placeholder="10000"
                    value={feeForm.labFee}
                    onChange={(e) => setFeeForm({ ...feeForm, labFee: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Library Fee</label>
                  <input
                    type="number"
                    placeholder="2000"
                    value={feeForm.libraryFee}
                    onChange={(e) => setFeeForm({ ...feeForm, libraryFee: e.target.value })}
                    className="form-control"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowFeeModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAddFeeStructure}>
                <Save size={16} />
                {editingFeeId ? 'Update' : 'Add'} Fee Structure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Record Fee Payment</h2>
              <button className="close-btn" onClick={() => setShowPaymentModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Student Name *</label>
                <input
                  type="text"
                  placeholder="Student name"
                  value={paymentForm.studentName}
                  onChange={(e) => setPaymentForm({ ...paymentForm, studentName: e.target.value })}
                  className="form-control"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Roll No *</label>
                  <input
                    type="text"
                    placeholder="STU001"
                    value={paymentForm.rollNo}
                    onChange={(e) => setPaymentForm({ ...paymentForm, rollNo: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Semester</label>
                  <select
                    value={paymentForm.semester}
                    onChange={(e) => setPaymentForm({ ...paymentForm, semester: e.target.value })}
                    className="form-control"
                  >
                    <option value="">Select Semester</option>
                    <option value="Semester 1">Semester 1</option>
                    <option value="Semester 2">Semester 2</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Paid Amount *</label>
                  <input
                    type="number"
                    placeholder="67000"
                    value={paymentForm.paidAmount}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paidAmount: e.target.value })}
                    className="form-control"
                  />
                </div>
                <div className="form-group">
                  <label>Payment Method</label>
                  <select
                    value={paymentForm.paymentMethod}
                    onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                    className="form-control"
                  >
                    <option value="Online">Online</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Cash</option>
                    <option value="Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="receipt-info">
                <small>Receipt Number: {defaultReceiptNumber}</small>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleRecordPayment}>
                <Save size={16} />
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeeManagement;