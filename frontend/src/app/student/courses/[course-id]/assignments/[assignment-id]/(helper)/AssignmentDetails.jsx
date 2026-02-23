export default function AssignmentDetails({ assignmentData }) {
  return (
    <header className="border-b-2 border-secondary pb-6">
      {/* <span className="text-subheading mb-2 block">{name}</span> */}
      <h1 className="text-h1">{assignmentData?.name}</h1>
      <p className="text-body mt-2 opacity-80">{assignmentData?.description}</p>
      <p>Deadline: {assignmentData?.deadline}</p>
      <p>Max Points: {assignmentData?.max_points_allowed}</p>
      <p>
        Is Grouped Assignment: {assignmentData?.is_grouped ? "True" : "False"}
      </p>
      {assignmentData?.starter_code && (
        <a href={`${assignmentData?.starter_code}`} target="_blank">
          <button className="px-4 py-2 bg-primary text-white rounded">
            Starter Code
          </button>
        </a>
      )}
    </header>
  );
}
