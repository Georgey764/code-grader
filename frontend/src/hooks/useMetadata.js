export default function useMetadata() {
  const NEXT_PUBLIC_URL = process.env.NEXT_PUBLIC_URL;
  return {
    name: "Code Grader",
    author: "The Devs",
    url: NEXT_PUBLIC_URL,
  };
}
