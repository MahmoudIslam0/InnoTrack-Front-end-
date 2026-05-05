import { Badge } from "@/components/ui/badge";

interface Technology {
  name: string;
  count: number;
  category: string;
}

const technologies: Technology[] = [
  { name: "React", count: 45, category: "Frontend" },
  { name: "Python", count: 38, category: "Backend" },
  { name: "TensorFlow", count: 32, category: "AI/ML" },
  { name: "Flutter", count: 28, category: "Mobile" },
  { name: "Node.js", count: 26, category: "Backend" },
  { name: "MongoDB", count: 24, category: "Database" },
  { name: "React Native", count: 22, category: "Mobile" },
  { name: "Firebase", count: 21, category: "Backend" },
  { name: "OpenCV", count: 19, category: "Computer Vision" },
  { name: "Docker", count: 18, category: "DevOps" },
  { name: "Blockchain", count: 16, category: "Web3" },
  { name: "GraphQL", count: 15, category: "API" },
];

export function TrendingTechnologies() {
  return (
    <section>
      <h3 className="text-lg font-semibold text-foreground mb-6">
        Trending Technologies
      </h3>

      <div className="bg-card text-card-foreground rounded-2xl p-6 border border-border shadow-sm">
        <div className="flex flex-wrap gap-3">
          {technologies.map((tech) => (
            <div
              key={tech.name}
              className="flex items-center gap-2 px-4 py-2.5 bg-background/50 hover:bg-indigo-500/10 border border-border/50 hover:border-indigo-500/30 rounded-xl transition-all duration-300 group cursor-pointer"
            >
              <span className="font-medium text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {tech.name}
              </span>
              <Badge
                variant="secondary"
                className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs border-transparent"
              >
                {tech.count}
              </Badge>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Pro Tip:</span> These
            technologies are currently being used by the highest number of
            approved graduation projects.
          </p>
        </div>
      </div>
    </section>
  );
}
