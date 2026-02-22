import AssignmentUploadPage from "./(helper)/page";
import { use } from "react";

export default function Page({ params }) {
  const { "course-id": courseId, "assignment-id": assignmentId } = use(params);
  return (
    <AssignmentUploadPage courseId={courseId} assignmentId={assignmentId} />
  );
}
