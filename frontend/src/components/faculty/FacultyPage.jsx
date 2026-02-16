"use client";

import { useMetadata } from "@/context";
import { useEffect } from "react";

export default function FacultyPage({}) {
  const { api, name, baseUrl } = useMetadata();

  useEffect(() => {}, []);

  return <div className="bg-green-500">{name} HIIIIIIIII</div>;
}
