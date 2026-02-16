"use client";

import { useMetadata } from "@/context";
import { useEffect } from "react";

export default function FacultyPage({}) {
  const { baseUrl, api, user, name } = useMetadata();

  const handlePost = async () => {
    try {
      const response = await api.post(`${baseUrl}courses/`, {
        name: "Intro to Programming",
        crn: 19234,
        short_name: "CS101",
        description: "Basics of programming",
        is_active: true,
      });
      console.log(response);
    } catch (error) {
      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Error Data:", error.response.data);
      } else {
        console.log("Error:", error.message);
      }
    }
  };

  const handleGet = async () => {
    try {
      const response = await api.get(
        `${baseUrl}courses/841d631d-4f54-4c12-9c37-8b3cd499fcdb`,
      );
      console.log(response);
    } catch (error) {
      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Error Data:", error.response.data);
      } else {
        console.log("Error:", error.message);
      }
    }
  };

  return (
    <div className="">
      {name} <button onClick={handlePost}> SUbmit</button>
      <button onClick={handleGet}> SUbmit</button>
    </div>
  );
}
