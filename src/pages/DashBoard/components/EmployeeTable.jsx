function EmployeeTable({ employees, departments, jobs, onView, onEdit, onDelete }) {
  function getDeptName(id) {
    const d = departments.find((d) => d.departmentId === id);
    return d ? d.departmentName : id;
  }

  function getJobTitle(id) {
    const j = jobs.find((j) => j.jobId === id);
    return j ? j.jobTitle : id;
  }

  if (employees.length === 0) return <p>No employees yet.</p>;

  return (
    <div className="table-wrapper">
      <table className="emp-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Department</th>
            <th>Job</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.employeeId}>
              <td>{emp.employeeId}</td>
              <td>{emp.firstName} {emp.lastName}</td>
              <td>{emp.email}</td>
              <td>{emp.phone}</td>
              <td>{getDeptName(emp.departmentId)}</td>
              <td>{getJobTitle(emp.jobId)}</td>
              <td>{emp.status}</td>
              <td className="action-cell">
                <button className="view-btn" onClick={() => onView(emp.employeeId)}>View</button>
                <button className="edit-btn" onClick={() => onEdit(emp)}>Edit</button>
                <button className="delete-btn" onClick={() => onDelete(emp.employeeId)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeTable;
