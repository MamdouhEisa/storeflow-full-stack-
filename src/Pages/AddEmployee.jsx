import EmployeeFormPage from "./EmployeeFormPage";
import { createEmployee } from "../api/employees";

export default function AddEmployeePage() {
  return (
    <EmployeeFormPage
      mode="add"
      title="Add New Employee"
      submitLabel="Add Employee"
      onSubmit={(payload) => createEmployee(payload)}
    />
  );
}
