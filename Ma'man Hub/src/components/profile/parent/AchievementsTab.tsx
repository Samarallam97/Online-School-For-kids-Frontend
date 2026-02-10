import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award, Loader2, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { studentService } from "@/services/studentService";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export function AchievementsTab() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        setIsLoading(true);
        const response = await studentService.getAchievements();
        setAchievements(response);
      } catch (error: any) {
        console.error("Failed to load achievements:", error);
        setAchievements([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAchievements();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Achievements</CardTitle>
        <CardDescription>
          Badges and milestones you've earned through learning
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : achievements.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex flex-col items-center rounded-lg border p-6 text-center"
              >
                <span className="text-4xl">{achievement.icon}</span>
                <h3 className="mt-3 font-medium">{achievement.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {achievement.description}
                </p>
                {achievement.earnedAt && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Earned {new Date(achievement.earnedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No achievements yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              Complete courses, ace quizzes, and maintain learning streaks to earn achievements and showcase your progress.
            </p>
            <Button asChild>
              <Link to="/courses">
                <Trophy className="mr-2 h-4 w-4" />
                Start Learning
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}