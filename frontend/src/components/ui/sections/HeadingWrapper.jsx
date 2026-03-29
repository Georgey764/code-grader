"use client";

import { CreateButton } from "@/components/ui/elements";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import DisplayBody from "./(helper)/HeadingWrapperDisplayBody";

const linker = {
  // Faculty: Settings
  "/dashboard/faculty/settings": {
    name: "Settings",
    message: "View your Profile Settings",
  },
  // Faculty: Create Course
  "/dashboard/faculty/create-course": {
    name: "Create Course",
    message: "Create a Course for your Students",
  },
  // Faculty: Course List
  "/dashboard/faculty": {
    name: "Courses",
    message: "View your Courses",
    buttonIn: (
      <CreateButton
        message="Create Course"
        link="/dashboard/faculty/create-course"
      />
    ),
  },
  // Faculty: Course Detail
  "/dashboard/faculty/id": {
    name: "Course Detail",
    message: "View the Details for the Selected Course",
    buttonIn: <CreateButton message="Edit Course" childLink="edit" />,
  },
  // Faculty: Course Detail Edit
  "/dashboard/faculty/id/edit": {
    name: "Edit Course Detail",
    message: "Edit the Details for the Selected Course",
  },
  // Faculty: Course Roster List
  "/dashboard/faculty/id/roster": {
    name: "Rosters",
    message: "View the Roster for Selected Course",
    buttonIn: <CreateButton message="Add Students" childLink="add" />,
  },
  // Faculty: Add Students to Roster
  "/dashboard/faculty/id/roster/add": {
    name: "Add Students",
    message: "Enroll Students in the Selected Course",
  },
  // Faculty: Student Results (Roster Detail)
  "/dashboard/faculty/id/roster/id": {
    name: "Student Results",
    message: "View Performance for the Selected Student",
  },
  // Faculty: Assignment List
  "/dashboard/faculty/id/assignments": {
    name: "Assignments List",
    message: "View all Assignments of Selected Course",
    buttonIn: (
      <CreateButton
        message="Create Assignment"
        link="assignments/create-assignment"
      />
    ),
  },
  // Faculty Assignment Detail
  "/dashboard/faculty/id/assignments/id": {
    name: "Assignment Detail",
    message: "View Assignment Detail Selected Assignment",
    buttonIn: (
      <CreateButton message="Edit Assignment" childLink="edit-assignment" />
    ),
  },
  // Edit Faculty Assignment Detail
  "/dashboard/faculty/id/assignments/id/edit-assignment": {
    name: "Edit Assignment Detail",
    message: "Edit Assignment Detail Selected Assignment",
  },
  // Faculty Assignment Submissions Detail
  "/dashboard/faculty/id/assignments/id/submissions": {
    name: "Submissions",
    message: "View all Submissions for Selected Assignment",
  },
  // Faculty Create Assignmnet
  "/dashboard/faculty/id/assignments/create-assignment": {
    name: "Create Assignment",
    message: "Create an Assignment for the Selected Course",
  },
  // Faculty: Test Cases List
  "/dashboard/faculty/id/assignments/id/test-cases": {
    name: "Test Cases",
    message: "View all Test Cases for Selected Course",
    buttonIn: <CreateButton message="Create Test Case" childLink="create" />,
  },
  // Faculty: Test Case Create
  "/dashboard/faculty/id/assignments/id/test-cases/create": {
    name: "Create Test Case",
    message: "Create a Test Case for your Selected Assignment",
  },
  // Faculty: Test Case Edit
  "/dashboard/faculty/id/assignments/id/test-cases/edit": {
    name: "Edit Test Case",
    message: "Edit the Test Case for your Selected Assignment",
  },
  // Faculty: Rubric Criteria List
  "/dashboard/faculty/id/assignments/id/rubrics": {
    name: "Rubric Criteria",
    message: "View All Rubric Criteria for Selected Course",
    buttonIn: (
      <CreateButton message="Create Rubric Criterion" childLink="create" />
    ),
  },
  // Faculty: Rubric Criterion Create
  "/dashboard/faculty/id/assignments/id/rubrics/create": {
    name: "Create Rubric Criterion",
    message: "Create a Rubric Criterion for your Selected Assignment",
  },
  // Faculty: Rubric Criterion Edit
  "/dashboard/faculty/id/assignments/id/rubrics/edit": {
    name: "Edit Rubric Criterion",
    message: "Edit the Rubric Criterion for your Selected Assignment",
  },
  // Faculty: View Submissions by Roster
  "/dashboard/faculty/id/assignments/id/submissions/view": {
    name: "View Submissions",
    message: "View all submissions for your Selected Assignment's Roster",
  },
  // Faculty: View Groups
  "/dashboard/faculty/id/assignments/id/groups": {
    name: "View Groups",
    message: "View all groups for your Selected Assignment",
    buttonIn: <CreateButton message="Create Group" childLink="create" />,
  },
  // Faculty: Grade View Page
  "/dashboard/faculty/id/grades": {
    name: "Gradebook",
    message: "Weighted Points & Diagnostic Summary",
  },
  // Faculty: Course grade report (per-student)
  "/dashboard/faculty/id/grade-report": {
    name: "Grade Report",
    message: "Per-student averages and latest submissions by assignment",
  },
  // Faculty: Grade View Page
  "/dashboard/faculty/id/grades/id": {
    name: "Grade Detail",
    message: "View the Details for the Selected Grade",
  },
  // Student: Courses List
  "/dashboard/student": {
    name: "Courses",
    message: "View your Courses",
    buttonIn: <CreateButton message="Join New Course" childLink="join" />,
  },
  // Student: Join Course
  "/dashboard/student/join": {
    name: "Join Course",
    message: "Enroll in a Course using the Course ID",
  },
  // Student: Course Detail
  "/dashboard/student/id": {
    name: "Course Detail",
    message: "View your Course Detail for Selected Course",
  },
  // Student: Assignments List
  "/dashboard/student/id/assignments": {
    name: "Assignments",
    message: "View all Assignments for your Selected Course",
  },
  // Student: Course grades (self)
  "/dashboard/student/id/grades": {
    name: "Grades",
    message: "Your scores and rubric breakdown for this course",
  },
  // Student: Assignment Detail
  "/dashboard/student/id/assignments/id": {
    name: "Assignment Detail",
    message: "View Assignment Detail for your Selected Assignment",
  },
  // Student: Test Cases (Read-only)
  "/dashboard/student/id/assignments/id/test-cases": {
    name: "Test Cases",
    message: "View Test Cases for your Selected Assignment",
  },
  // Student: Rubric Criteria (Read-only)
  "/dashboard/student/id/assignments/id/rubrics": {
    name: "Rubric Criteria",
    message: "View Rubric Criteria for your Selected Assignment",
  },
  // Student: To Do
  "/dashboard/student/to-do": {
    name: "To Do",
    message: "Your Tasks and Course Overview",
  },
  // Student: Settings
  "/dashboard/student/settings": {
    name: "Settings",
    message: "View your Profile Settings",
  },
  // Playground
  "/dashboard/playground": {
    name: "Playground",
    message: "Code Editor & Terminal Sandbox",
  },
};

function isUUID(str) {
  const regex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(str);
}

export default function HeadingWrapper({
  children,
  name,
  message,
  buttonIn = null,
}) {
  const pathname = usePathname();
  const linkKey = useMemo(() => {
    let pathnameArray = pathname.split("/");
    for (let i = 0; i < pathnameArray.length; i++) {
      if (isUUID(pathnameArray[i])) {
        pathnameArray[i] = "id";
      }
    }
    let newPathname = pathnameArray.join("/");
    return linker[newPathname] || null;
  }, [pathname]);

  return (
    <>
      {linkKey ? (
        <DisplayBody
          name={linkKey?.name}
          message={linkKey?.message}
          buttonIn={linkKey?.buttonIn}
        >
          {children}
        </DisplayBody>
      ) : name ? (
        <DisplayBody name={name} message={message} buttonIn={buttonIn}>
          {children}
        </DisplayBody>
      ) : (
        <>{children}</>
      )}
    </>
  );
}
