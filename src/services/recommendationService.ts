/**
 * Hybrid Recommendation Engine
 * Combines collaborative filtering and content-based recommendations
 * Inspired by Netflix and Spotify's multi-algorithm approach
 */

interface UserInteraction {
  userId: string;
  modelId: string;
  rating?: number;
  purchased: boolean;
  viewed: boolean;
  timeSpent: number;
  timestamp: Date;
}

interface ModelFeatures {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  price: number;
  complexity: number;
  performance: number;
  usage_count: number;
  average_rating: number;
  created_at: Date;
}

interface RecommendationResult {
  modelId: string;
  score: number;
  reason: string;
  confidence: number;
}

export class HybridRecommendationEngine {
  private userItemMatrix: Map<string, Map<string, number>> = new Map();
  private modelEmbeddings: Map<string, number[]> = new Map();
  private userProfiles: Map<string, number[]> = new Map();
  private modelFeatures: Map<string, ModelFeatures> = new Map();
  
  constructor() {
    this.initializeEngine();
  }

  async initializeEngine() {
    // Load user interactions and model data
    await this.loadUserInteractions();
    await this.loadModelFeatures();
    await this.computeEmbeddings();
  }

  /**
   * Collaborative Filtering using Matrix Factorization
   * Simplified implementation of NMF approach
   */
  private async computeCollaborativeFiltering(): Promise<void> {
    const users = Array.from(this.userItemMatrix.keys());
    const models = Array.from(this.modelFeatures.keys());
    
    // Create user-item matrix
    const matrix: number[][] = [];
    for (const userId of users) {
      const userRow: number[] = [];
      const userInteractions = this.userItemMatrix.get(userId) || new Map();
      
      for (const modelId of models) {
        const interaction = userInteractions.get(modelId) || 0;
        userRow.push(interaction);
      }
      matrix.push(userRow);
    }
    
    // Simplified matrix factorization
    // In production, use proper SVD or NMF libraries
    const factors = 50;
    const userFactors = this.initializeMatrix(users.length, factors);
    const itemFactors = this.initializeMatrix(factors, models.length);
    
    // Store computed factors for recommendations
    for (let i = 0; i < users.length; i++) {
      this.userProfiles.set(users[i], userFactors[i]);
    }
  }

  /**
   * Content-Based Filtering using Semantic Similarity
   */
  private async computeContentBasedSimilarity(targetModel: string, userHistory: string[]): Promise<number> {
    const targetEmbedding = this.modelEmbeddings.get(targetModel) || [];
    if (targetEmbedding.length === 0) return 0;
    
    let totalSimilarity = 0;
    let count = 0;
    
    for (const historyModelId of userHistory) {
      const historyEmbedding = this.modelEmbeddings.get(historyModelId) || [];
      if (historyEmbedding.length > 0) {
        const similarity = this.cosineSimilarity(targetEmbedding, historyEmbedding);
        totalSimilarity += similarity;
        count++;
      }
    }
    
    return count > 0 ? totalSimilarity / count : 0;
  }

  /**
   * Generate Hybrid Recommendations
   */
  async getRecommendations(
    userId: string, 
    count: number = 10,
    diversityWeight: number = 0.3
  ): Promise<RecommendationResult[]> {
    const userHistory = await this.getUserHistory(userId);
    const allModels = Array.from(this.modelFeatures.keys());
    const userProfile = this.userProfiles.get(userId) || [];
    
    const recommendations: RecommendationResult[] = [];
    
    for (const modelId of allModels) {
      // Skip if user already interacted with this model
      if (userHistory.includes(modelId)) continue;
      
      // Collaborative filtering score
      const collabScore = this.calculateCollaborativeScore(userId, modelId);
      
      // Content-based score
      const contentScore = await this.computeContentBasedSimilarity(modelId, userHistory);
      
      // Popularity score (trending models)
      const popularityScore = this.calculatePopularityScore(modelId);
      
      // Business metrics
      const businessScore = this.calculateBusinessScore(modelId);
      
      // Hybrid scoring with weights
      const hybridScore = 
        0.4 * collabScore +
        0.3 * contentScore +
        0.2 * popularityScore +
        0.1 * businessScore;
      
      // Calculate confidence based on data availability
      const confidence = this.calculateConfidence(userId, modelId);
      
      recommendations.push({
        modelId,
        score: hybridScore,
        reason: this.generateReason(collabScore, contentScore, popularityScore),
        confidence
      });
    }
    
    // Sort by score
    recommendations.sort((a, b) => b.score - a.score);
    
    // Apply diversity filtering
    const diverseRecs = this.applyDiversityFilter(recommendations, diversityWeight);
    
    return diverseRecs.slice(0, count);
  }

  /**
   * Real-time recommendation updates based on user interactions
   */
  async updateUserProfile(userId: string, interaction: UserInteraction): Promise<void> {
    // Update user-item matrix
    if (!this.userItemMatrix.has(userId)) {
      this.userItemMatrix.set(userId, new Map());
    }
    
    const userInteractions = this.userItemMatrix.get(userId)!;
    
    // Calculate interaction strength
    let interactionScore = 0;
    if (interaction.purchased) interactionScore += 5;
    if (interaction.rating) interactionScore += interaction.rating;
    if (interaction.viewed) interactionScore += 1;
    if (interaction.timeSpent > 60) interactionScore += 2; // Engaged viewing
    
    userInteractions.set(interaction.modelId, interactionScore);
    
    // Incrementally update user profile
    await this.updateUserProfileVector(userId, interaction);
  }

  /**
   * A/B Testing for Recommendation Algorithms
   */
  async getRecommendationsWithExperiment(
    userId: string,
    experimentGroup: 'control' | 'treatment'
  ): Promise<RecommendationResult[]> {
    if (experimentGroup === 'treatment') {
      // Test new algorithm variant
      return this.getExperimentalRecommendations(userId);
    } else {
      // Control group - standard algorithm
      return this.getRecommendations(userId);
    }
  }

  // Helper Methods
  private calculateCollaborativeScore(userId: string, modelId: string): number {
    const userProfile = this.userProfiles.get(userId) || [];
    const modelFeatures = this.modelFeatures.get(modelId);
    
    if (userProfile.length === 0 || !modelFeatures) return 0;
    
    // Simplified collaborative scoring
    // In production, use proper matrix factorization results
    return Math.random() * 0.8 + 0.1; // Placeholder
  }

  private calculatePopularityScore(modelId: string): number {
    const model = this.modelFeatures.get(modelId);
    if (!model) return 0;
    
    // Combine usage count and rating with recency
    const usageScore = Math.log(model.usage_count + 1) / 10;
    const ratingScore = model.average_rating / 5;
    const recencyScore = this.calculateRecencyScore(model.created_at);
    
    return (usageScore + ratingScore + recencyScore) / 3;
  }

  private calculateBusinessScore(modelId: string): number {
    const model = this.modelFeatures.get(modelId);
    if (!model) return 0;
    
    // Factors that benefit the business
    const profitabilityScore = model.price / 1000; // Higher price = higher score
    const performanceScore = model.performance / 100;
    
    return (profitabilityScore + performanceScore) / 2;
  }

  private calculateConfidence(userId: string, modelId: string): number {
    const userInteractionCount = this.userItemMatrix.get(userId)?.size || 0;
    const modelInteractionCount = this.modelFeatures.get(modelId)?.usage_count || 0;
    
    // More data = higher confidence
    const userDataConfidence = Math.min(userInteractionCount / 10, 1);
    const modelDataConfidence = Math.min(modelInteractionCount / 100, 1);
    
    return (userDataConfidence + modelDataConfidence) / 2;
  }

  private applyDiversityFilter(
    recommendations: RecommendationResult[], 
    diversityWeight: number
  ): RecommendationResult[] {
    const diverseRecs: RecommendationResult[] = [];
    const selectedCategories = new Set<string>();
    
    for (const rec of recommendations) {
      const model = this.modelFeatures.get(rec.modelId);
      if (!model) continue;
      
      // Penalize if same category already selected
      let diversityPenalty = 0;
      if (selectedCategories.has(model.category)) {
        diversityPenalty = diversityWeight * selectedCategories.size * 0.1;
      }
      
      const adjustedScore = rec.score - diversityPenalty;
      
      diverseRecs.push({
        ...rec,
        score: adjustedScore
      });
      
      selectedCategories.add(model.category);
    }
    
    return diverseRecs.sort((a, b) => b.score - a.score);
  }

  private generateReason(collabScore: number, contentScore: number, popularityScore: number): string {
    if (collabScore > contentScore && collabScore > popularityScore) {
      return "Users like you also purchased this";
    } else if (contentScore > popularityScore) {
      return "Similar to your previous purchases";
    } else {
      return "Trending in the marketplace";
    }
  }

  // Utility methods
  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    
    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private initializeMatrix(rows: number, cols: number): number[][] {
    return Array(rows).fill(null).map(() => 
      Array(cols).fill(null).map(() => Math.random())
    );
  }

  private calculateRecencyScore(createdAt: Date): number {
    const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return Math.exp(-daysSinceCreation / 30); // Exponential decay over 30 days
  }

  // Data loading methods (to be implemented with actual API calls)
  private async loadUserInteractions(): Promise<void> {
    // TODO: Load from Supabase
  }

  private async loadModelFeatures(): Promise<void> {
    // TODO: Load from Supabase
  }

  private async computeEmbeddings(): Promise<void> {
    // TODO: Compute using sentence transformers or OpenAI embeddings
  }

  private async getUserHistory(userId: string): Promise<string[]> {
    // TODO: Get user's interaction history
    return [];
  }

  private async updateUserProfileVector(userId: string, interaction: UserInteraction): Promise<void> {
    // TODO: Incrementally update user embedding
  }

  private async getExperimentalRecommendations(userId: string): Promise<RecommendationResult[]> {
    // TODO: Implement experimental algorithm
    return this.getRecommendations(userId);
  }
}

export default HybridRecommendationEngine;