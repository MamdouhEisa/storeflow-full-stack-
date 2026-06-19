import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BranchFormPage from "./BranchesFormPage";
import { fetchBranchById, updateBranch } from "../api/branches";

export default function EditBranchPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [branch, setBranch] = useState(null);
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
        const result = await fetchBranchById(id);
        if (!isMounted) return;
        setBranch(result);
      } catch (err) {
        if (!isMounted) return;
        setError(err.message || "Failed to load branch.");
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
        <div className="mx-auto max-w-[860px] rounded-3xl border border-dashed border-[#d3d3d3]  p-10 text-center">
          <p className="text-base text-[#80858d]">Loading branch...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-[860px] rounded-3xl border border-dashed border-[#f3c5c5]  p-10 text-center">
          <p className="text-base text-[#b42323]">{error}</p>
        </div>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="min-h-screen px-4 py-8 sm:px-8">
        <div className="mx-auto max-w-[860px] rounded-3xl border border-dashed border-[#d3d3d3]  p-10 text-center">
          <p className="text-base text-[#80858d]">Branch not found.</p>
          <button
            type="button"
            onClick={() => navigate("/branches")}
            className="mt-4 rounded-xl bg-[#ff7a1a] px-5 py-2 text-sm font-semibold text-white"
          >
            Back to branches
          </button>
        </div>
      </div>
    );
  }

  return (
    <BranchFormPage
      mode="edit"
      title={`Edit ${branch.name}`}
      submitLabel="Save Changes"
      initialValues={{
        branchName: branch.name,
        streetAddress: branch.address,
        city: branch.city,
        email: branch.email,
        phone: branch.phone,
        branchManager: branch.manager,
      }}
      onSubmit={(payload) => updateBranch(id, payload)}
    />
  );
}
