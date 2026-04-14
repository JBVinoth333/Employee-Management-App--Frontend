import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../../config';
import AddDepartmentForm from './components/AddDepartmentForm';
import AddEmployeeForm from './components/AddEmployeeForm';
import DepartmentTable from './components/DepartmentTable';
import EmployeeTable from './components/EmployeeTable';
import EmployeeModal from './components/EmployeeModal';
import EditEmployeeModal from './components/EditEmployeeModal';
import EditDepartmentModal from './components/EditDepartmentModal';
import './DashBoard.css';

const API = `${BASE_URL}/api`;

function DashBoard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('departments');

  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [deptManagers, setDeptManagers] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [selectedEmp, setSelectedEmp] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [editingEmp, setEditingEmp] = useState(null);
  const [showEditEmpModal, setShowEditEmpModal] = useState(false);

  const [editingDept, setEditingDept] = useState(null);
  const [showEditDeptModal, setShowEditDeptModal] = useState(false);

  const [showAddDept, setShowAddDept] = useState(false);
  const [showAddEmp, setShowAddEmp] = useState(false);

  useEffect(() => {
    fetch(API + '/session', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated) {
          navigate('/login');
        } else {
          loadData();
        }
      })
      .catch(() => navigate('/login'));
  }, []);

  function loadData() {
    fetch(API + '/departments', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setDepartments(data))
      .catch(() => {});

    fetch(API + '/employees', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setEmployees(data))
      .catch(() => {});

    fetch(API + '/jobs', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setJobs(data))
      .catch(() => {});

    fetch(API + '/deptManager', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setDeptManagers(data))
      .catch(() => {});
  }

  function handleLogout() {
    fetch(API + '/logout', { method: 'POST', credentials: 'include' })
      .then(() => navigate('/login'))
      .catch(() => navigate('/login'));
  }

  function viewEmployee(id) {
    fetch(API + '/employee?id=' + id, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        setSelectedEmp(data);
        setShowModal(true);
      })
      .catch(() => alert('Failed to load employee details'));
  }

  function deleteEmployee(id) {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    fetch(API + '/employee?id=' + id, { method: 'DELETE', credentials: 'include' })
      .then((res) => res.json())
      .then(() => {
        loadData();
        if (showModal) setShowModal(false);
      })
      .catch(() => alert('Failed to delete employee'));
  }

  function addDepartment(data) {
    fetch(API + '/addDepartment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then(() => loadData())
      .catch(() => alert('Failed to add department'));
  }

  function assignManager(deptId, managerId) {
    fetch(API + '/deptManager', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ departmentId: deptId, managerId }),
    })
      .then((res) => res.json())
      .then(() => loadData())
      .catch(() => alert('Failed to assign manager'));
  }

  function removeManager(deptId) {
    if (!window.confirm('Remove manager from this department?')) return;
    fetch(API + '/deptManager?departmentId=' + deptId, { method: 'DELETE', credentials: 'include' })
      .then((res) => res.json())
      .then(() => loadData())
      .catch(() => alert('Failed to remove manager'));
  }

  function openEditEmployee(emp) {
    setEditingEmp({ ...emp });
    setShowEditEmpModal(true);
  }

  function updateEmployee(data) {
    fetch(API + '/updateEmployee', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then(() => {
        setShowEditEmpModal(false);
        setEditingEmp(null);
        setShowModal(false);
        loadData();
      })
      .catch(() => alert('Failed to update employee'));
  }

  function updateDepartment(data) {
    fetch(API + '/updateDepartment', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then(() => {
        setShowEditDeptModal(false);
        setEditingDept(null);
        loadData();
      })
      .catch(() => alert('Failed to update department'));
  }

  function addEmployee(data) {
    fetch(API + '/addEmployee', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then(() => {
        loadData();
        alert('Employee added!');
      })
      .catch(() => alert('Failed to add employee'));
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="tab-bar">
        <button className={tab === 'departments' ? 'tab active' : 'tab'} onClick={() => setTab('departments')}>
          Departments
        </button>
        <button className={tab === 'employees' ? 'tab active' : 'tab'} onClick={() => setTab('employees')}>
          Employees
        </button>
      </div>

      {tab === 'departments' && (
        <div className="tab-content">
          <button className="toggle-form-btn" onClick={() => setShowAddDept(!showAddDept)}>
            {showAddDept ? '− Cancel' : '+ Add Department'}
          </button>
          {showAddDept && <AddDepartmentForm onAdd={addDepartment} />}
          <h3>Current Departments</h3>
          <DepartmentTable
            departments={departments}
            employees={employees}
            deptManagers={deptManagers}
            onEdit={(dept) => { setEditingDept({ ...dept }); setShowEditDeptModal(true); }}
            onAssignManager={assignManager}
            onRemoveManager={removeManager}
          />
        </div>
      )}

      {tab === 'employees' && (
        <div className="tab-content">
          <button className="toggle-form-btn" onClick={() => setShowAddEmp(!showAddEmp)}>
            {showAddEmp ? '− Cancel' : '+ Add Employee'}
          </button>
          {showAddEmp && <AddEmployeeForm departments={departments} jobs={jobs} onAdd={addEmployee} />}
          <h3>Employee List</h3>
          <EmployeeTable
            employees={employees}
            departments={departments}
            jobs={jobs}
            onView={viewEmployee}
            onEdit={openEditEmployee}
            onDelete={deleteEmployee}
          />
        </div>
      )}

      {showModal && selectedEmp && (
        <EmployeeModal
          employee={selectedEmp}
          departments={departments}
          jobs={jobs}
          onClose={() => setShowModal(false)}
          onEdit={openEditEmployee}
          onDelete={deleteEmployee}
        />
      )}

      {showEditEmpModal && editingEmp && (
        <EditEmployeeModal
          employee={editingEmp}
          departments={departments}
          jobs={jobs}
          onClose={() => setShowEditEmpModal(false)}
          onSave={updateEmployee}
        />
      )}

      {showEditDeptModal && editingDept && (
        <EditDepartmentModal
          department={editingDept}
          onClose={() => setShowEditDeptModal(false)}
          onSave={updateDepartment}
        />
      )}
    </div>
  );
}

export default DashBoard;
