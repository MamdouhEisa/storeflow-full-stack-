import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EmployeeFormPage from "./EmployeeFormPage";
import { fetchEmployeeById, updateEmployee } from "../api/employees";

export default function EditEmployeePage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError("");
      try {
        const result = await fetchEmployeeById(id);
        if (!isMounted) return;
        setEmployee(result);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "Failed to load employee.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-215 rounded-3xl border border-dashed border-[#d3d3d3] bg-[#f7f7f7] p-10 text-center">
          <p className="text-base text-[#80858d]">Loading employee...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-215 rounded-3xl border border-dashed border-[#f3c5c5] bg-[#fff7f7] p-10 text-center">
          <p className="text-base text-[#b42323]">{error}</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-215 rounded-3xl border border-dashed border-[#d3d3d3] bg-[#f7f7f7] p-10 text-center">
          <p className="text-base text-[#80858d]">Employee not found.</p>
          <button
            type="button"
            onClick={() => navigate("/employees")}
            className="mt-4 rounded-xl bg-[#ff7a1a] px-5 py-2 text-sm font-semibold text-white"
          >
            Back to employees
          </button>
        </div>
      </div>
    );
  }

  return (
    <EmployeeFormPage
      mode="edit"
      title={`Edit ${employee.fullName}`}
      submitLabel="Save Changes"
      initialValues={{
        fullName: employee.fullName,
        email: employee.email,
        phone: employee.phone,
        role: employee.role,
        branch: employee.branch,
        password: "",
      }}
      onSubmit={(payload) => updateEmployee(id, payload)}
    />
  );
}
