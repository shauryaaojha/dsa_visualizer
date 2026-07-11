import { StringVisualizerScreen } from "@/components/visualizer/StringVisualizerScreen";

export default function Page() {
  return (
    <StringVisualizerScreen
      path="/topics/strings/classic-problems/valid-palindrome"
      title="Valid Palindrome"
      blurb="Compare both ends inward (#125)."
      operation="strPalindrome"
      defaultParams={{ text: "racecar" }}
    />
  );
}
