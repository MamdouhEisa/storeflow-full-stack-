import BranchFormPage from "./BranchesFormPage";
import { createBranch } from "../api/branches";

export default function AddBranchPage() {
  return (
    <BranchFormPage
      mode="add"
      title="Add New Branch"
      submitLabel="Add Branch"
      onSubmit={(payload) => createBranch(payload)}
    />
  );
}
