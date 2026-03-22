/**
 * Another comment for the course grade report.
 * Per-assignment percentage on a 0–100 scale for course averaging.
 * - Weighted: uses API total_points (sum of (points/max)*weights, typically 0–100).
 * - Unweighted: (sum of earned points / sum of max_points from returned rubric rows) * 100.
 */
export function assignmentPercentFromSubmission(submission, isWeighted) {
  if (!submission?.rubric_results?.length) return null;
  if (isWeighted) {
    const v = Number(submission.total_points);
    return Number.isFinite(v) ? Math.round(v * 100) / 100 : null;
  }
  const earned = Number(submission.total_points);
  if (!Number.isFinite(earned)) return null;
  const maxPossible = submission.rubric_results.reduce(
    (s, r) => s + Number(r.max_points ?? 0),
    0,
  );
  if (maxPossible <= 0) return null;
  return Math.round((earned / maxPossible) * 10000) / 100;
}

export function overallCourseAverage(percents) {
  const vals = percents.filter((p) => p != null && Number.isFinite(p));
  if (!vals.length) return null;
  const sum = vals.reduce((a, b) => a + b, 0);
  return Math.round((sum / vals.length) * 100) / 100;
}

/**
 * @param {Record<string, Map<string,string>>} groupMaps - assignment_id -> (roster id -> group id)
 */
export function findGradeRow(assignment, rosterId, groupMaps) {
  const rid = String(rosterId);
  if (!assignment.is_grouped) {
    return assignment.data?.find((d) => String(d.entity_id) === rid) ?? null;
  }
  const gid = groupMaps?.[assignment.assignment_id]?.get(rid);
  if (!gid) return null;
  return (
    assignment.data?.find((d) => String(d.entity_id) === String(gid)) ?? null
  );
}

export async function fetchRosterToGroupMaps(api, gradeData) {
  const grouped = (gradeData || []).filter((a) => a.is_grouped);
  const out = {};
  await Promise.all(
    grouped.map(async (a) => {
      try {
        const res = await api.get(`assignments/${a.assignment_id}/groups/`);
        const list = Array.isArray(res.data)
          ? res.data
          : (res.data?.results ?? []);
        const m = new Map();
        for (const grp of list) {
          for (const mem of grp.group_memberships || []) {
            const rid = mem.roster ?? mem.roster_student?.id;
            if (rid != null) m.set(String(rid), String(grp.id));
          }
        }
        out[a.assignment_id] = m;
      } catch {
        out[a.assignment_id] = new Map();
      }
    }),
  );
  return out;
}

export function buildStudentReports(rosters, gradeData, groupMaps) {
  const assignments = gradeData || [];
  return (rosters || [])
    .map((roster) => {
      const user = roster.student_profile?.user;
      const name = user
        ? `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
          user.email
        : "Unknown";
      const email = user?.email ?? "";
      const cwid = user?.cwid != null ? String(user.cwid) : "";
      const rid = roster.id;

      const assignmentRows = [];
      const percents = [];

      for (const asg of assignments) {
        const dataRow = findGradeRow(asg, rid, groupMaps);
        const sub = dataRow?.submission ?? null;
        const pct = assignmentPercentFromSubmission(sub, asg.is_weighted);
        if (pct != null) percents.push(pct);

        assignmentRows.push({
          assignmentId: asg.assignment_id,
          assignmentName: asg.assignment_name,
          isGrouped: asg.is_grouped,
          isWeighted: asg.is_weighted,
          groupOrEntityLabel: dataRow?.entity_name ?? null,
          dataRow,
          submission: sub,
          percent: pct,
        });
      }

      return {
        rosterId: rid,
        name,
        email,
        cwid,
        assignmentRows,
        overall: overallCourseAverage(percents),
        gradedAssignmentCount: percents.length,
        totalAssignments: assignments.length,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * For `GET courses/.../my-grades/` where each assignment block has at most one row (this student).
 */
export function buildSingleStudentReportFromMyGrades(roster, gradeData) {
  const assignments = gradeData || [];
  const user = roster.student_profile?.user;
  const name = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email
    : "Unknown";
  const email = user?.email ?? "";
  const cwid = user?.cwid != null ? String(user.cwid) : "";

  const assignmentRows = [];
  const percents = [];

  for (const asg of assignments) {
    const dataRow = asg.data?.[0] ?? null;
    const sub = dataRow?.submission ?? null;
    const pct = assignmentPercentFromSubmission(sub, asg.is_weighted);
    if (pct != null) percents.push(pct);

    assignmentRows.push({
      assignmentId: asg.assignment_id,
      assignmentName: asg.assignment_name,
      isGrouped: asg.is_grouped,
      isWeighted: asg.is_weighted,
      groupOrEntityLabel: dataRow?.entity_name ?? null,
      dataRow,
      submission: sub,
      percent: pct,
    });
  }

  return {
    rosterId: roster.id,
    name,
    email,
    cwid,
    assignmentRows,
    overall: overallCourseAverage(percents),
    gradedAssignmentCount: percents.length,
    totalAssignments: assignments.length,
  };
}

function escapeCsvCell(v) {
  const s = String(v ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function buildReportCsv(reports, courseName = "") {
  const lines = [];
  lines.push(
    [
      "Student",
      "Email",
      "CWID",
      "OverallAvgPercent",
      "GradedAssignments",
      "TotalAssignments",
      "Assignment",
      "Grouped",
      "Weighted",
      "GroupName",
      "HasSubmission",
      "AssignmentPercent",
      "RubricCriteria",
      "Points",
      "MaxPoints",
      "WeightedPoints",
      "Feedback",
    ].join(","),
  );

  for (const st of reports) {
    const base = [
      escapeCsvCell(st.name),
      escapeCsvCell(st.email),
      escapeCsvCell(st.cwid),
      st.overall ?? "",
      st.gradedAssignmentCount,
      st.totalAssignments,
    ];
    for (const ar of st.assignmentRows) {
      const sub = ar.submission;
      const rubrics = sub?.rubric_results ?? [];
      if (!rubrics.length) {
        lines.push(
          [
            ...base,
            escapeCsvCell(ar.assignmentName),
            ar.isGrouped ? "yes" : "no",
            ar.isWeighted ? "yes" : "no",
            escapeCsvCell(ar.groupOrEntityLabel ?? ""),
            sub ? "yes" : "no",
            ar.percent ?? "",
            "",
            "",
            "",
            "",
            "",
          ].join(","),
        );
        continue;
      }
      for (const rr of rubrics) {
        lines.push(
          [
            ...base,
            escapeCsvCell(ar.assignmentName),
            ar.isGrouped ? "yes" : "no",
            ar.isWeighted ? "yes" : "no",
            escapeCsvCell(ar.groupOrEntityLabel ?? ""),
            sub ? "yes" : "no",
            ar.percent ?? "",
            escapeCsvCell(rr.criteria_name),
            rr.points,
            rr.max_points,
            rr.weighted_points ?? "",
            escapeCsvCell(rr.optional_feedback ?? ""),
          ].join(","),
        );
      }
    }
  }

  return `\ufeff${lines.join("\n")}`;
}

export function buildReportTxt(reports, courseName = "") {
  const blocks = [];
  blocks.push(`GRADE REPORT${courseName ? ` — ${courseName}` : ""}`);
  blocks.push(
    "Overall average = mean of per-assignment % (weighted: rubric weights; unweighted: points / max).",
  );
  blocks.push("");

  for (const st of reports) {
    blocks.push("—".repeat(60));
    blocks.push(`Student: ${st.name}`);
    blocks.push(`Email: ${st.email}`);
    blocks.push(`CWID: ${st.cwid || "—"}`);
    blocks.push(
      `Overall: ${st.overall != null ? `${st.overall}%` : "N/A"} (${st.gradedAssignmentCount}/${st.totalAssignments} assignments with rubric grades)`,
    );
    blocks.push("");

    for (const ar of st.assignmentRows) {
      blocks.push(`  Assignment: ${ar.assignmentName}`);
      blocks.push(
        `    Mode: ${ar.isGrouped ? "Group" : "Individual"} | Rubric: ${ar.isWeighted ? "Weighted" : "Unweighted"}`,
      );
      if (ar.isGrouped && ar.groupOrEntityLabel)
        blocks.push(`    Group: ${ar.groupOrEntityLabel}`);
      if (!ar.submission) {
        blocks.push(`    Latest submission: none`);
        blocks.push("");
        continue;
      }
      blocks.push(
        `    Latest submission: ${ar.submission.id} @ ${ar.submission.created_at}`,
      );
      blocks.push(
        `    Assignment score (${ar.isWeighted ? "weighted %" : "norm %"}): ${ar.percent != null ? `${ar.percent}%` : "—"}`,
      );
      const rubrics = ar.submission.rubric_results ?? [];
      if (!rubrics.length) {
        blocks.push(`    Rubric: no results yet`);
      } else {
        blocks.push(`    Rubric:`);
        for (const rr of rubrics) {
          blocks.push(
            `      • ${rr.criteria_name}: ${rr.points} / ${rr.max_points}${ar.isWeighted ? ` (weighted pts: ${rr.weighted_points})` : ""}`,
          );
          if (rr.optional_feedback)
            blocks.push(`        Feedback: ${rr.optional_feedback}`);
        }
      }
      blocks.push("");
    }
  }

  return blocks.join("\n");
}

export function downloadBlob(filename, content, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
