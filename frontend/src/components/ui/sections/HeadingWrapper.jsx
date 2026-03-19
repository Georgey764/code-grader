"use client";

import Link from "next/link";
import { CreateButton } from "@/components/ui/elements";
import { Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import { useMemo } from "react";
import DisplayBody from "./(helper)/HeadingWrapperDisplayBody";

const linker = {
  // Faculty: Settings
  "/app/faculty/settings": {
    name: "Settings",
    message: "View your Profile Settings",
  },
  // Faculty: Create Course
  "/app/faculty/create-course": {
    name: "Create Course",
    message: "Create a Course for your Students",
  },
  // Faculty: Course List
  "/app/faculty": {
    name: "Courses",
    message: "View your Courses",
    buttonIn: (
      <CreateButton message="Create Course" link="/app/faculty/create-course" />
    ),
  },
  // Faculty: Course Detail
  "/app/faculty/id": {
    name: "Course Detail",
    message: "View the Details for the Selected Course",
    buttonIn: <CreateButton message="Edit Course" childLink="edit" />,
  },
  // Faculty: Course Detail Edit
  "/app/faculty/edit": {
    name: "Edit Course Detail",
    message: "Edit the Details for the Selected Course",
  },
  //Faculty: Course Roster List
  "/app/faculty/id/roster": {
    name: "Rosters",
    message: "View the Roster for Selected Course",
    buttonIn: <CreateButton message="Add Students" childLink="add" />,
  },
  // Faculty: Assignment List
  "/app/faculty/id/assignments": {
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
  "/app/faculty/id/assignments/id": {
    name: "Assignment Detail",
    message: "View Assignment Detail Selected Assignment",
    buttonIn: (
      <CreateButton message="Edit Assignment" childLink="edit-assignment" />
    ),
  },
  // Edit Faculty Assignment Detail
  "/app/faculty/id/assignments/id/edit-assignment": {
    name: "Edit Assignment Detail",
    message: "Edit Assignment Detail Selected Assignment",
  },
  // Faculty Assignment Submissions Detail
  "/app/faculty/id/assignments/id/submissions": {
    name: "Submissions",
    message: "View all Submissions for Selected Assignment",
  },
  // Faculty Create Assignmnet
  "/app/faculty/id/assignments/create-assignment": {
    name: "Create Assignment",
    message: "Create an Assignment for the Selected Course",
  },
  // Faculty: Test Cases List
  "/app/faculty/id/assignments/id/test-cases": {
    name: "Test Cases",
    message: "View all Test Cases for Selected Course",
    buttonIn: <CreateButton message="Create Test Case" childLink="create" />,
  },
  // Faculty: Test Case Create
  "/app/faculty/id/assignments/id/test-cases/create": {
    name: "Create Test Case",
    message: "Create a Test Case for your Selected Assignment",
  },
  // Faculty: Rubric Criteria List
  "/app/faculty/id/assignments/id/rubrics": {
    name: "Rubric Criteria",
    message: "View All Rubric Criteria for Selected Course",
    buttonIn: (
      <CreateButton message="Create Rubric Criterion" childLink="create" />
    ),
  },
  // Faculty: Rubric Criterion Create
  "/app/faculty/id/assignments/id/rubrics/create": {
    name: "Create Rubric Criterion",
    message: "Create a Rubric Criterion for your Selected Assignment",
  },
  // Faculty: Rubric Criterion Create
  "/app/faculty/id/assignments/id/submissions/view": {
    name: "View Submissions",
    message: "View all submissions for your Selected Assignment's Roster",
  },
  // Faculty: Grade View Page
  "/app/faculty/id/grades": {
    name: "Gradebook",
    message: "Weighted Points & Diagnostic Summary",
  },
  // Faculty: Grade View Page
  "/app/faculty/id/grades/id": {
    name: "Grade Detail",
    message: "View the Details for the Selected Grade",
  },
  // Student: Courses List
  "/app/student": {
    name: "Courses",
    message: "View your Courses",
    buttonIn: <CreateButton message="Join New Course" childLink="join" />,
  },
  // Course Detail
  "/app/student/id": {
    name: "Course Detail",
    message: "View your Course Detail for Selected Course",
  },
  // Student: Assignments List
  "/app/student/id/assignments": {
    name: "Assignments",
    message: "View all Assignments for your Selected Course",
  },
  // Student: Assignments Detail
  "/app/student/id/assignments/id": {
    name: "Assignment Detail",
    message: "View Assignment Detail for your Selected Assignment",
  },
  // Student: Settings
  "/app/student/settings": {
    name: "Settings",
    message: "View your Profile Settings",
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
