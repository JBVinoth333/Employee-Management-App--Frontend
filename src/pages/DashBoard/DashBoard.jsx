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
  const [visibleEmployees, setVisibleEmployees] = useState([]);
  const [deptManagers, setDeptManagers] = useState([]);
  const [jobs, setJobs] = useState([]);

  
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [employeeStatus, setEmployeeStatus] = useState('all');
  const [employeeDepartment, setEmployeeDepartment] = useState('all');
  const [employeeSortBy, setEmployeeSortBy] = useState('name');
  const [employeeSortOrder, setEmployeeSortOrder] = useState('asc');
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [employeeError, setEmployeeError] = useState('');

  const [selectedEmp, setSelectedEmp] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [editingEmp, setEditingEmp] = useState(null);
  const [showEditEmpModal, setShowEditEmpModal] = useState(false);

  const [editingDept, setEditingDept] = useState(null);
  const [showEditDeptModal, setShowEditDeptModal] = useState(false);

  const [showAddDept, setShowAddDept] = useState(false);
  const [showAddEmp, setShowAddEmp] = useState(false);

  function loadEmployeeList(searchValue = employeeSearch, statusValue = employeeStatus, departmentValue = employeeDepartment) {
    const params = new URLSearchParams();

    if (searchValue.trim()) {
      params.set('search', searchValue.trim());
    }
    if (statusValue !== 'all') {
      params.set('status', statusValue);
    }
    if (departmentValue !== 'all') {
      params.set('departmentId', departmentValue);
    }

    const query = params.toString();
    setEmployeeLoading(true);
    setEmployeeError('');

    fetch(API + '/employees' + (query ? '?' + query : ''), { credentials: 'include' })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load employees');
        }
        return res.json();
      })
      .then((data) => setVisibleEmployees(data))
      .catch(() => {
        setVisibleEmployees([]);
        setEmployeeError('Failed to load employee list');
      })
      .finally(() => setEmployeeLoading(false));
  }

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

    loadEmployeeList();
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
        setShowAddEmp(false);
        alert('Employee added!');
      })
      .catch(() => alert('Failed to add employee'));
  }

  function getSortedEmployees() {
    const sortedEmployees = [...visibleEmployees];

    sortedEmployees.sort((employeeA, employeeB) => {
      let valueA;
      let valueB;

      if (employeeSortBy === 'name') {
        valueA = `${employeeA.firstName || ''} ${employeeA.lastName || ''}`.trim().toLowerCase();
        valueB = `${employeeB.firstName || ''} ${employeeB.lastName || ''}`.trim().toLowerCase();
      } else if (employeeSortBy === 'salary') {
        valueA = Number(employeeA.salary) || 0;
        valueB = Number(employeeB.salary) || 0;
      } else {
        const timestampA = Date.parse(employeeA.hireDate);
        const timestampB = Date.parse(employeeB.hireDate);
        valueA = Number.isNaN(timestampA) ? 0 : timestampA;
        valueB = Number.isNaN(timestampB) ? 0 : timestampB;
      }

      if (valueA < valueB) {
        return employeeSortOrder === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return employeeSortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return sortedEmployees;
  }

  useEffect(() => {
    fetch(API + '/departments', { credentials: 'include' })
      .then((res) => res.json())
      .then((departmentsData) => setDepartments(departmentsData))
      .catch(() => {});

    setEmployeeLoading(true);
    setEmployeeError('');
    fetch(API + '/employees', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to load employees');
        }
        return res.json();
      })
      .then((employeesData) => {
        setEmployees(employeesData);
        setVisibleEmployees(employeesData);
      })
      .catch(() => {
        setEmployees([]);
        setVisibleEmployees([]);
        setEmployeeError('Failed to load employee list');
      })
      .finally(() => setEmployeeLoading(false));

    fetch(API + '/jobs', { credentials: 'include' })
      .then((res) => res.json())
      .then((jobsData) => setJobs(jobsData))
      .catch(() => {});

    fetch(API + '/deptManager', { credentials: 'include' })
      .then((res) => res.json())
      .then((managerData) => setDeptManagers(managerData))
      .catch(() => {});
  }, []);

  const activeEmployees = employees.filter((employee) => employee.status === 'Active').length;
  const inactiveEmployees = employees.filter((employee) => employee.status !== 'Active').length;
  const sortedVisibleEmployees = getSortedEmployees();

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
          <div className="summary-grid">
            <div className="summary-card">
              <span className="summary-label">Total Employees</span>
              <strong>{employees.length}</strong>
            </div>
            <div className="summary-card">
              <span className="summary-label">Active</span>
              <strong>{activeEmployees}</strong>
            </div>
            <div className="summary-card">
              <span className="summary-label">Inactive</span>
              <strong>{inactiveEmployees}</strong>
            </div>
            <div className="summary-card">
              <span className="summary-label">Visible Results</span>
              <strong>{visibleEmployees.length}</strong>
            </div>
          </div>

          <button className="toggle-form-btn" onClick={() => setShowAddEmp(!showAddEmp)}>
            {showAddEmp ? '− Cancel' : '+ Add Employee'}
          </button>
          {showAddEmp && <AddEmployeeForm departments={departments} jobs={jobs} onAdd={addEmployee} />}

          <div className="employee-filters">
            <input
              type="search"
              value={employeeSearch}
              onChange={(e) => {
                const value = e.target.value;
                setEmployeeSearch(value);
                loadEmployeeList(value, employeeStatus, employeeDepartment);
              }}
              placeholder="Search by name, email, phone or ID"
            />
            <select
              value={employeeStatus}
              onChange={(e) => {
                const value = e.target.value;
                setEmployeeStatus(value);
                loadEmployeeList(employeeSearch, value, employeeDepartment);
              }}
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <select
              value={employeeDepartment}
              onChange={(e) => {
                const value = e.target.value;
                setEmployeeDepartment(value);
                loadEmployeeList(employeeSearch, employeeStatus, value);
              }}
            >
              <option value="all">All Departments</option>
              {departments.map((department) => (
                <option key={department.departmentId} value={department.departmentId}>
                  {department.departmentName}
                </option>
              ))}
            </select>
            <select
              value={employeeSortBy}
              onChange={(e) => setEmployeeSortBy(e.target.value)}
            >
              <option value="name">Sort by Name</option>
              <option value="salary">Sort by Salary</option>
              <option value="hireDate">Sort by Hire Date</option>
            </select>
            <select
              value={employeeSortOrder}
              onChange={(e) => setEmployeeSortOrder(e.target.value)}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
            <button
              className="clear-filter-btn"
              type="button"
              onClick={() => {
                setEmployeeSearch('');
                setEmployeeStatus('all');
                setEmployeeDepartment('all');
                setEmployeeSortBy('name');
                setEmployeeSortOrder('asc');
                loadEmployeeList('', 'all', 'all');
              }}
            >
              Clear
            </button>
          </div>

          <h3>Employee List</h3>
          {employeeError && <p className="table-message error">{employeeError}</p>}
          {employeeLoading && <p className="table-message">Loading employees...</p>}
          <EmployeeTable
            employees={sortedVisibleEmployees}
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
