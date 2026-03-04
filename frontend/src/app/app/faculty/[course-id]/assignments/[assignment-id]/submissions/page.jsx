"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMetadata } from "@/context";
import { Roster } from "@/components/graders/elements";

export default function SubmissionsPage() {
  const param = useParams();
  const courseId = param["course-id"];
  const assignmentId = param["assignment-id"];

  const router = useRouter();
  const [rosters, setRosters] = useState([]);
  const [isGrouped, setIsGrouped] = useState(null); // derive from assignment data, not URL
  const [loading, setLoading] = useState(true);
  const { api } = useMetadata();

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        // First, determine if this assignment is grouped from the backend
        const assignmentRes = await api.get(`assignments/${assignmentId}/`);
        const grouped = assignmentRes.data?.is_grouped === true;
        setIsGrouped(grouped);

        // Then fetch either groups or rosters based on that flag
        let response;
        if (grouped) {
          response = await api.get(`assignments/${assignmentId}/groups/`);
        } else {
          response = await api.get(`courses/${courseId}/rosters/`);
        }
        setRosters(response.data);
      } catch (err) {
        console.error("Error fetching submissions:", err);
        console.log(err.response);
      } finally {
        setLoading(false);
      }
    };
    fetchPageData();
  }, [api, assignmentId, courseId]);

  if (loading) {
    return <div className="p-4 text-sm text-text-muted">Loading submissions...</div>;
  }

  return (
    <div>
      {isGrouped === false && (
        <Roster
          rosters={rosters}
          onClick={(entry, current_pathname) =>
            router.push(current_pathname + "/view?roster_id=" + entry.id)
          }
        />
      )}
      {isGrouped === true && (
        <div className="p-4 text-sm text-text-muted">
          Grouped submissions view coming soon.
        </div>
      )}
    </div>
  );
}
