import ExperienceSection from "~/components/experience-section";
import type { Route } from "./+types/experience"
import type { Experience } from "~/types/experience";

export const loader = async () => {
  const experienceData = (await import("../data/experience.json")).default;
  return experienceData as Experience[];
};

export default function Experience({
  loaderData,
}: Route.ComponentProps) {
  const experienceData = loaderData as Experience[];
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Experience</h2>
      <ul className="space-y-6">
        {experienceData && experienceData.map((exp, index) => (
          <li key={index} className="border-b pb-4 last:border-b-0">
            <ExperienceSection experience={exp} />
          </li>
        ))}
      </ul>
    </div>
  );
}
