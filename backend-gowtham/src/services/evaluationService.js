const { db } = require("../config/firebase");

/**
 * EVALUATION RULES ENGINE
 * Provides rule-based evaluation logic for pass/fail and performance grading
 * Ready for future AI/ML API integration
 */

// Define evaluation rules
const EVALUATION_RULES = {
  // Pass/Fail Rules
  passFail: {
    minimumPassingScore: 50, // 50% threshold
    calculateResult: (score, passingScore = 50) => {
      return {
        passed: score >= passingScore,
        status: score >= passingScore ? "PASS" : "FAIL",
        performanceLevel: score >= passingScore ? "PROFICIENT" : "NEEDS_IMPROVEMENT",
      };
    },
  },

  // Performance Grading Rules
  performanceGrading: {
    grades: {
      A: { min: 90, description: "Excellent" },
      B: { min: 80, description: "Good" },
      C: { min: 70, description: "Satisfactory" },
      D: { min: 60, description: "Acceptable" },
      F: { min: 0, description: "Needs Improvement" },
    },
    calculateGrade: (score) => {
      const gradeMap = {
        A: { min: 90, description: "Excellent", points: 4.0 },
        B: { min: 80, description: "Good", points: 3.0 },
        C: { min: 70, description: "Satisfactory", points: 2.0 },
        D: { min: 60, description: "Acceptable", points: 1.0 },
        F: { min: 0, description: "Needs Improvement", points: 0.0 },
      };

      for (const [grade, info] of Object.entries(gradeMap)) {
        if (score >= info.min) {
          return {
            grade,
            ...info,
            score,
          };
        }
      }
    },
  },

  // Competency-based Evaluation
  competencyEvaluation: {
    levels: {
      BEGINNER: { score: 0, description: "Just starting" },
      DEVELOPING: { score: 40, description: "Building competency" },
      PROFICIENT: { score: 70, description: "Competent and skilled" },
      ADVANCED: { score: 85, description: "Mastery level" },
      EXPERT: { score: 95, description: "Expert level" },
    },
    calculateCompetency: (score) => {
      const levels = [
        { level: "EXPERT", minScore: 95 },
        { level: "ADVANCED", minScore: 85 },
        { level: "PROFICIENT", minScore: 70 },
        { level: "DEVELOPING", minScore: 40 },
        { level: "BEGINNER", minScore: 0 },
      ];

      for (const { level, minScore } of levels) {
        if (score >= minScore) {
          return {
            level,
            score,
            recommendation: getCompetencyRecommendation(level),
          };
        }
      }
    },
  },

  // Time-based Performance
  timeBasedPerformance: {
    evaluateTimeEfficiency: (score, timeTaken, expectedTime) => {
      const timeEfficiency = (expectedTime / timeTaken) * 100;
      const speedBonus = timeEfficiency > 150 ? 5 : timeEfficiency > 120 ? 3 : 0;

      return {
        baseScore: score,
        timeEfficiency: Math.round(timeEfficiency),
        speedBonus,
        adjustedScore: Math.min(score + speedBonus, 100),
        performanceRating:
          timeEfficiency > 150
            ? "EXCELLENT (Fast & Accurate)"
            : timeEfficiency > 120
            ? "GOOD (Efficient)"
            : timeEfficiency > 100
            ? "AVERAGE (On Time)"
            : "NEEDS_IMPROVEMENT (Slow)",
      };
    },
  },

  // Weighted Multi-Criteria Evaluation
  multiCriteriaEvaluation: {
    evaluateMultiple: (criteria) => {
      /**
       * criteria = {
       *   knowledge: { score: 80, weight: 0.4 },
       *   application: { score: 75, weight: 0.3 },
       *   engagement: { score: 85, weight: 0.3 }
       * }
       */

      let totalScore = 0;
      let totalWeight = 0;

      for (const [criterionName, criterion] of Object.entries(criteria)) {
        totalScore += criterion.score * criterion.weight;
        totalWeight += criterion.weight;
      }

      const weightedScore = totalWeight > 0 ? totalScore / totalWeight : 0;

      return {
        weightedScore: Math.round(weightedScore),
        breakdown: criteria,
        overallGrade: EVALUATION_RULES.performanceGrading.calculateGrade(
          weightedScore
        ),
      };
    },
  },
};

// Competency recommendations based on level
function getCompetencyRecommendation(level) {
  const recommendations = {
    EXPERT: "Continue mentoring others and exploring advanced topics",
    ADVANCED:
      "Ready for advanced challenges and specialized topics",
    PROFICIENT:
      "Solid foundation; consider advanced certifications",
    DEVELOPING:
      "Practice more exercises and review key concepts",
    BEGINNER:
      "Review fundamentals and complete foundational modules",
  };
  return recommendations[level] || "Continue learning";
}

// Evaluate a single assessment
exports.evaluateAssessment = async (submissionId) => {
  try {
    const submissionDoc = await db
      .collection("assessment_submissions")
      .doc(submissionId)
      .get();

    if (!submissionDoc.exists) {
      throw new Error("Submission not found");
    }

    const submission = submissionDoc.data();
    const { score, totalScore, timeTaken, courseId } = submission;
    const percentage = Math.round((score / totalScore) * 100);

    // Apply all evaluation rules
    const evaluation = {
      submissionId,
      score: percentage,
      passFail: EVALUATION_RULES.passFail.calculateResult(percentage),
      performanceGrade:
        EVALUATION_RULES.performanceGrading.calculateGrade(percentage),
      competency: EVALUATION_RULES.competencyEvaluation.calculateCompetency(
        percentage
      ),
      evaluatedAt: new Date(),
    };

    // Store evaluation
    await db.collection("evaluations").add(evaluation);

    return evaluation;
  } catch (error) {
    throw error;
  }
};

// Evaluate user performance across multiple assessments
exports.evaluateUserPerformance = async (userId, courseId) => {
  try {
    const snapshot = await db
      .collection("assessment_submissions")
      .where("userId", "==", userId)
      .where("courseId", "==", courseId)
      .get();

    if (snapshot.empty) {
      throw new Error("No assessments found for this user in the course");
    }

    const submissions = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Calculate average performance
    const criteria = {
      knowledge: {
        score: Math.round(
          submissions.reduce((sum, s) => sum + s.percentage, 0) /
            submissions.length
        ),
        weight: 0.5,
      },
      consistency: {
        score: 100 - calculateScoreVariance(submissions),
        weight: 0.3,
      },
      participation: {
        score: calculateParticipationScore(submissions),
        weight: 0.2,
      },
    };

    const userPerformance = {
      userId,
      courseId,
      totalAssessments: submissions.length,
      multiCriteriaEvaluation:
        EVALUATION_RULES.multiCriteriaEvaluation.evaluateMultiple(criteria),
      overallCompetency:
        EVALUATION_RULES.competencyEvaluation.calculateCompetency(
          criteria.knowledge.score
        ),
      submissions: submissions.length,
      passedAssessments: submissions.filter((s) => s.passed).length,
      passRate: Math.round(
        (submissions.filter((s) => s.passed).length / submissions.length) * 100
      ),
      evaluatedAt: new Date(),
    };

    return userPerformance;
  } catch (error) {
    throw error;
  }
};

// Helper function to calculate score variance (for consistency)
function calculateScoreVariance(submissions) {
  if (submissions.length === 0) return 0;

  const mean =
    submissions.reduce((sum, s) => sum + s.percentage, 0) / submissions.length;
  const variance =
    submissions.reduce((sum, s) => sum + Math.pow(s.percentage - mean, 2), 0) /
    submissions.length;
  const stdDev = Math.sqrt(variance);

  // Normalize to 0-100 scale (lower variance = higher consistency score)
  return Math.max(0, 100 - stdDev);
}

// Helper function to calculate participation score
function calculateParticipationScore(submissions) {
  // Based on number of submissions and attempt frequency
  const baseScore = Math.min(submissions.length * 10, 100);
  const timeGaps = calculateTimeGaps(submissions);
  const consistencyBonus = timeGaps.averageGapDays < 7 ? 10 : 0;

  return Math.min(baseScore + consistencyBonus, 100);
}

// Helper function to calculate time gaps between submissions
function calculateTimeGaps(submissions) {
  if (submissions.length < 2) return { averageGapDays: 0 };

  const dates = submissions
    .map((s) => new Date(s.submittedAt).getTime())
    .sort((a, b) => a - b);

  const gaps = [];
  for (let i = 1; i < dates.length; i++) {
    gaps.push((dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24)); // Convert to days
  }

  return {
    averageGapDays: gaps.reduce((sum, g) => sum + g, 0) / gaps.length,
  };
}

// Export rules for API access
exports.getEvaluationRules = () => {
  return {
    passFail: EVALUATION_RULES.passFail.minimumPassingScore,
    gradeScale: Object.entries(EVALUATION_RULES.performanceGrading.grades).map(
      ([grade, info]) => ({
        grade,
        ...info,
      })
    ),
    competencyLevels: Object.entries(
      EVALUATION_RULES.competencyEvaluation.levels
    ).map(([level, info]) => ({
      level,
      ...info,
    })),
  };
};
