import type { Experience } from "~/types/experience";
import { Badge } from "./ui/badge";

type ExperienceSectionProps = {
  experience: Experience;
};

export default function ExperienceSection({ experience }: ExperienceSectionProps) {
  return (
    <article>
      <h3 className="text-lg font-medium">{experience.company} - {experience.title}</h3>
      <div className="flex flex-wrap gap-2 mt-2">
        {experience.skills.map((skill) => (
          <Badge key={skill} variant="secondary">
            {skill}
          </Badge>
        ))}
      </div>
      {experience.description.map((desc) => (
        <p className="mt-2" key={desc}>
          {desc}
        </p>
      ))}
    </article>
  );
}