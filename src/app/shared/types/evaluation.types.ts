export interface CreateEvaluationRequest {
  teacher: string;
  nomEvaluation: string;
  dateEvaluation: string;
  typeEval: string;
  criteres?: number[]; // IDs of selected criteria
}

export interface CreateGroupEvaluationRequest {
  criteriaScores: Array<{
    critereId: number;
    score: number;
    comment?: string;
  }>;
  generalComments?: string;
  grilleEvaluationId: number;
}

export interface CreateIndividualEvaluationRequest {
  studentEvaluations: Array<{
    studentName: string;
    criteriaScores: Array<{
      critereId: number;
      score: number;
    }>;
  }>;
  generalComments?: string;
  grilleEvaluationId: number;
}