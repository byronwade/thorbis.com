"use client";

import { useParams, useRouter } from "next/navigation";
import EmployeeProfile from "@components/dashboard/business/employees/EmployeeProfile";

export default function EmployeeProfilePage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id;

  const handleClose = () => {
    router.push("/dashboard/business/employees");
  };

  return (
    		<div className="w-full space-y-6">
      <EmployeeProfile employeeId={employeeId} onClose={handleClose} />
    </div>
  );
}
