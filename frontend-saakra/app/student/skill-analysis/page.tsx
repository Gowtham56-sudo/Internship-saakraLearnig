import { DashboardHeader } from "@/components/student/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Brain, TrendingUp, Target, Award, ArrowRight, Sparkles } from "lucide-react"

export default function SkillAnalysisPage() {
  const skillGaps = [
    { skill: "Data Structures", current: 45, target: 85, priority: "High" },
    { skill: "Web Development", current: 70, target: 90, priority: "Medium" },
    { skill: "Machine Learning", current: 30, target: 80, priority: "High" },
    { skill: "System Design", current: 55, target: 85, priority: "Medium" },
  ]

  const recommendations = [
    {
      title: "Advanced Data Structures Course",
      reason: "Fill your 40% skill gap in Data Structures",
      estimatedTime: "6 weeks",
    },
    {
      title: "ML Fundamentals Bootcamp",
      reason: "Build foundation for Machine Learning career",
      estimatedTime: "8 weeks",
    },
    {
      title: "System Design Masterclass",
      reason: "Improve your system thinking abilities",
      estimatedTime: "5 weeks",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Brain className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">AI Skill Gap Analysis</h1>
          </div>
          <p className="text-muted-foreground">
            Get personalized insights into your skills and discover areas for improvement
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Your Skill Profile
              </CardTitle>
              <CardDescription>AI-powered analysis based on your learning data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {skillGaps.map((skill) => (
                  <div key={skill.skill}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="font-medium">{skill.skill}</span>
                        <span
                          className={`ml-2 text-xs px-2 py-1 rounded ${
                            skill.priority === "High" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {skill.priority} Priority
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {skill.current}% / {skill.target}%
                      </span>
                    </div>
                    <Progress value={skill.current} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Gap: {skill.target - skill.current}% to reach target level
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Learning Insights
              </CardTitle>
              <CardDescription>AI-generated recommendations for you</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Strong Foundation</p>
                    <p className="text-xs text-muted-foreground">
                      Your web development skills are above average. Consider advanced topics.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <Target className="h-5 w-5 text-orange-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Focus Area</p>
                    <p className="text-xs text-muted-foreground">
                      Data Structures needs immediate attention for interview preparation.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <Award className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Career Path</p>
                    <p className="text-xs text-muted-foreground">
                      You're 65% ready for Full Stack Developer roles. Complete 2 more courses.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Personalized Learning Path
            </CardTitle>
            <CardDescription>AI-curated courses to bridge your skill gaps</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{rec.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{rec.reason}</p>
                    <p className="text-xs text-primary">Est. Time: {rec.estimatedTime}</p>
                  </div>
                  <Button>
                    Enroll Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1">Get Your Complete AI Assessment</h3>
                <p className="text-sm text-muted-foreground">
                  Take our comprehensive skill test for detailed insights and personalized roadmap
                </p>
              </div>
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Start Assessment
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
