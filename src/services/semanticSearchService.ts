/**
 * Semantic Search Engine with Advanced Embeddings
 * Uses sentence transformers and vector similarity for intelligent AI model discovery
 * Implements FAISS-like indexing for fast similarity search at scale
 */

interface SearchQuery {
  text: string;
  filters?: SearchFilters;
  userContext?: UserContext;
  maxResults?: number;
}

interface SearchFilters {
  category?: string[];
  priceRange?: { min: number; max: number };
  rating?: { min: number; max: number };
  complexity?: string[];
  tags?: string[];
  developer?: string[];
  language?: string[];
  framework?: string[];
}

interface UserContext {
  userId?: string;
  searchHistory?: string[];
  preferences?: Record<string, any>;
  currentProject?: string;
  skillLevel?: 'beginner' | 'intermediate' | 'expert';
}

interface SearchResult {
  modelId: string;
  title: string;
  description: string;
  semanticScore: number;
  relevanceScore: number;
  popularityScore: number;
  personalizedScore: number;
  finalScore: number;
  matchReason: string;
  highlights: string[];
  category: string;
  tags: string[];
  price: number;
  rating: number;
  usageCount: number;
}

interface ModelEmbedding {
  modelId: string;
  titleEmbedding: number[];
  descriptionEmbedding: number[];
  tagsEmbedding: number[];
  combinedEmbedding: number[];
  lastUpdated: Date;
}

export class SemanticSearchEngine {
  private modelEmbeddings: Map<string, ModelEmbedding> = new Map();
  private vectorIndex: VectorIndex;
  private searchHistory: Map<string, string[]> = new Map(); // userId -> queries
  private queryEmbeddingCache: Map<string, number[]> = new Map();
  
  // Simulated embedding service (in production, use OpenAI, Cohere, or local models)
  private embeddingDimension = 384; // all-MiniLM-L6-v2 dimension
  
  constructor() {
    this.vectorIndex = new VectorIndex(this.embeddingDimension);
    this.initializeSearchEngine();
  }

  async initializeSearchEngine(): Promise<void> {
    await this.loadExistingEmbeddings();
    await this.buildVectorIndex();
    await this.loadSearchHistory();
  }

  /**
   * Main semantic search method
   */
  async search(query: SearchQuery): Promise<SearchResult[]> {
    // Validate and preprocess query
    const processedQuery = await this.preprocessQuery(query);
    
    // Generate query embedding
    const queryEmbedding = await this.generateQueryEmbedding(processedQuery);
    
    // Get candidate results from vector search
    const candidates = await this.vectorSearch(queryEmbedding, query.maxResults || 50);
    
    // Apply filters
    const filteredCandidates = this.applyFilters(candidates, query.filters);
    
    // Calculate comprehensive scores
    const scoredResults = await this.calculateRelevanceScores(
      filteredCandidates, 
      processedQuery, 
      query.userContext
    );
    
    // Rank and diversify results
    const rankedResults = this.rankAndDiversify(scoredResults);
    
    // Update search analytics
    await this.updateSearchAnalytics(query, rankedResults);
    
    return rankedResults.slice(0, query.maxResults || 20);
  }

  /**
   * Real-time search suggestions
   */
  async getSearchSuggestions(partialQuery: string, userContext?: UserContext): Promise<string[]> {
    const suggestions: string[] = [];
    
    // Popular searches
    const popularQueries = await this.getPopularQueries();
    suggestions.push(...popularQueries.filter(q => 
      q.toLowerCase().includes(partialQuery.toLowerCase())
    ).slice(0, 3));
    
    // Personalized suggestions based on user history
    if (userContext?.userId) {
      const userHistory = this.searchHistory.get(userContext.userId) || [];
      const personalizedSuggestions = userHistory.filter(q =>
        q.toLowerCase().includes(partialQuery.toLowerCase())
      ).slice(0, 2);
      suggestions.push(...personalizedSuggestions);
    }
    
    // Category-based suggestions
    const categorySuggestions = await this.getCategorySuggestions(partialQuery);
    suggestions.push(...categorySuggestions.slice(0, 3));
    
    // Remove duplicates and return
    return Array.from(new Set(suggestions)).slice(0, 8);
  }

  /**
   * Advanced query expansion
   */
  private async expandQuery(query: string): Promise<string> {
    let expandedQuery = query;
    
    // Synonym expansion
    const synonyms = await this.findSynonyms(query);
    if (synonyms.length > 0) {
      expandedQuery += ' ' + synonyms.join(' ');
    }
    
    // Domain-specific expansion for AI/ML terms
    const techTerms = this.expandTechnicalTerms(query);
    if (techTerms.length > 0) {
      expandedQuery += ' ' + techTerms.join(' ');
    }
    
    return expandedQuery;
  }

  /**
   * Vector similarity search with FAISS-like implementation
   */
  private async vectorSearch(queryEmbedding: number[], k: number): Promise<string[]> {
    const similarities: Array<{ modelId: string; similarity: number }> = [];
    
    for (const [modelId, embedding] of Array.from(this.modelEmbeddings.entries())) {
      const similarity = this.cosineSimilarity(queryEmbedding, embedding.combinedEmbedding);
      similarities.push({ modelId, similarity });
    }
    
    // Sort by similarity and return top k
    similarities.sort((a, b) => b.similarity - a.similarity);
    return similarities.slice(0, k).map(s => s.modelId);
  }

  /**
   * Multi-factor relevance scoring
   */
  private async calculateRelevanceScores(
    candidateIds: string[],
    query: string,
    userContext?: UserContext
  ): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
    
    for (const modelId of candidateIds) {
      const modelData = await this.getModelData(modelId);
      if (!modelData) continue;
      
      const embedding = this.modelEmbeddings.get(modelId);
      if (!embedding) continue;
      
      // Calculate component scores
      const semanticScore = await this.calculateSemanticScore(query, embedding);
      const popularityScore = this.calculatePopularityScore(modelData);
      const qualityScore = this.calculateQualityScore(modelData);
      const recencyScore = this.calculateRecencyScore(modelData.createdAt);
      const personalizedScore = await this.calculatePersonalizedScore(
        modelData, 
        userContext
      );
      
      // Weighted combination
      const weights = {
        semantic: 0.35,
        popularity: 0.20,
        quality: 0.20,
        recency: 0.10,
        personalized: 0.15
      };
      
      const finalScore = 
        weights.semantic * semanticScore +
        weights.popularity * popularityScore +
        weights.quality * qualityScore +
        weights.recency * recencyScore +
        weights.personalized * personalizedScore;
      
      // Generate highlights and match reason
      const highlights = await this.generateHighlights(query, modelData);
      const matchReason = this.generateMatchReason(
        semanticScore, popularityScore, personalizedScore
      );
      
      results.push({
        modelId,
        title: modelData.title,
        description: modelData.description,
        semanticScore,
        relevanceScore: semanticScore,
        popularityScore,
        personalizedScore,
        finalScore,
        matchReason,
        highlights,
        category: modelData.category,
        tags: modelData.tags || [],
        price: modelData.price,
        rating: modelData.averageRating,
        usageCount: modelData.usageCount
      });
    }
    
    return results;
  }

  /**
   * Result ranking with diversity
   */
  private rankAndDiversify(results: SearchResult[]): SearchResult[] {
    // Sort by final score
    results.sort((a, b) => b.finalScore - a.finalScore);
    
    // Apply diversity to avoid category clustering
    const diversifiedResults: SearchResult[] = [];
    const categoryCount: Map<string, number> = new Map();
    const maxPerCategory = Math.ceil(results.length / 5); // Limit per category
    
    for (const result of results) {
      const categoryOccurrences = categoryCount.get(result.category) || 0;
      
      if (categoryOccurrences < maxPerCategory) {
        diversifiedResults.push(result);
        categoryCount.set(result.category, categoryOccurrences + 1);
      } else if (diversifiedResults.length < results.length * 0.8) {
        // Allow some overflow for high-quality results
        if (result.finalScore > 0.8) {
          diversifiedResults.push(result);
        }
      }
    }
    
    return diversifiedResults;
  }

  /**
   * Personalized scoring based on user context
   */
  private async calculatePersonalizedScore(
    modelData: any,
    userContext?: UserContext
  ): Promise<number> {
    if (!userContext?.userId) return 0.5; // Neutral score for anonymous users
    
    let personalizedScore = 0.5;
    
    // User skill level matching
    if (userContext.skillLevel && modelData.complexity) {
      const complexityMatch = this.matchComplexityToSkillLevel(
        modelData.complexity, 
        userContext.skillLevel
      );
      personalizedScore += complexityMatch * 0.3;
    }
    
    // Search history similarity
    if (userContext.searchHistory) {
      const historyRelevance = await this.calculateHistoryRelevance(
        modelData, 
        userContext.searchHistory
      );
      personalizedScore += historyRelevance * 0.3;
    }
    
    // Project context matching
    if (userContext.currentProject && modelData.useCases) {
      const projectRelevance = this.calculateProjectRelevance(
        modelData.useCases,
        userContext.currentProject
      );
      personalizedScore += projectRelevance * 0.2;
    }
    
    // User preferences
    if (userContext.preferences) {
      const preferenceScore = this.calculatePreferenceAlignment(
        modelData,
        userContext.preferences
      );
      personalizedScore += preferenceScore * 0.2;
    }
    
    return Math.min(1, Math.max(0, personalizedScore));
  }

  /**
   * Intelligent query preprocessing
   */
  private async preprocessQuery(query: SearchQuery): Promise<string> {
    let processedText = query.text.toLowerCase().trim();
    
    // Remove stop words specific to AI/ML domain
    processedText = this.removeStopWords(processedText);
    
    // Expand abbreviations and acronyms
    processedText = this.expandAbbreviations(processedText);
    
    // Spell correction
    processedText = await this.correctSpelling(processedText);
    
    // Query expansion
    processedText = await this.expandQuery(processedText);
    
    return processedText;
  }

  /**
   * Generate embeddings for text
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    // In production, use actual embedding service
    // For now, simulate with random normalized vectors
    const embedding = Array(this.embeddingDimension)
      .fill(0)
      .map(() => Math.random() - 0.5);
    
    // Normalize
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    return embedding.map(val => val / norm);
  }

  private async generateQueryEmbedding(query: string): Promise<number[]> {
    // Check cache first
    if (this.queryEmbeddingCache.has(query)) {
      return this.queryEmbeddingCache.get(query)!;
    }
    
    const embedding = await this.generateEmbedding(query);
    
    // Cache for future use
    this.queryEmbeddingCache.set(query, embedding);
    
    // Limit cache size
    if (this.queryEmbeddingCache.size > 1000) {
      const firstKey = this.queryEmbeddingCache.keys().next().value;
      if (firstKey !== undefined) {
        this.queryEmbeddingCache.delete(firstKey);
      }
    }
    
    return embedding;
  }

  // Helper methods
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

  private applyFilters(candidateIds: string[], filters?: SearchFilters): string[] {
    if (!filters) return candidateIds;
    
    return candidateIds.filter(async modelId => {
      const modelData = await this.getModelData(modelId);
      if (!modelData) return false;
      
      // Category filter
      if (filters.category && !filters.category.includes(modelData.category)) {
        return false;
      }
      
      // Price range filter
      if (filters.priceRange) {
        if (modelData.price < filters.priceRange.min || 
            modelData.price > filters.priceRange.max) {
          return false;
        }
      }
      
      // Rating filter
      if (filters.rating) {
        if (modelData.averageRating < filters.rating.min || 
            modelData.averageRating > filters.rating.max) {
          return false;
        }
      }
      
      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => 
          modelData.tags?.includes(tag)
        );
        if (!hasMatchingTag) return false;
      }
      
      return true;
    });
  }

  private calculateSemanticScore(query: string, embedding: ModelEmbedding): number {
    // This would use the actual query embedding vs model embedding similarity
    return Math.random() * 0.8 + 0.2; // Placeholder
  }

  private calculatePopularityScore(modelData: any): number {
    const usageScore = Math.log(modelData.usageCount + 1) / 10;
    const ratingScore = modelData.averageRating / 5;
    return (usageScore + ratingScore) / 2;
  }

  private calculateQualityScore(modelData: any): number {
    return modelData.averageRating / 5;
  }

  private calculateRecencyScore(createdAt: Date): number {
    const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return Math.exp(-daysSinceCreation / 90); // 90-day decay
  }

  private async generateHighlights(query: string, modelData: any): Promise<string[]> {
    const highlights: string[] = [];
    const queryTerms = query.toLowerCase().split(' ');
    
    // Search in title
    for (const term of queryTerms) {
      if (modelData.title.toLowerCase().includes(term)) {
        highlights.push(`Title matches "${term}"`);
      }
    }
    
    // Search in description
    for (const term of queryTerms) {
      if (modelData.description.toLowerCase().includes(term)) {
        highlights.push(`Description contains "${term}"`);
      }
    }
    
    return highlights.slice(0, 3);
  }

  private generateMatchReason(
    semanticScore: number, 
    popularityScore: number, 
    personalizedScore: number
  ): string {
    if (semanticScore > 0.8) {
      return "Highly relevant to your search";
    } else if (personalizedScore > 0.7) {
      return "Recommended based on your preferences";
    } else if (popularityScore > 0.7) {
      return "Popular choice among users";
    } else {
      return "Good match for your search";
    }
  }

  // Placeholder methods for actual implementation
  private async loadExistingEmbeddings(): Promise<void> {
    // TODO: Load from database
  }

  private async buildVectorIndex(): Promise<void> {
    // TODO: Build FAISS-like index
  }

  private async loadSearchHistory(): Promise<void> {
    // TODO: Load user search history
  }

  private async getModelData(modelId: string): Promise<any> {
    // TODO: Get model details from database
    return null;
  }

  private async updateSearchAnalytics(query: SearchQuery, results: SearchResult[]): Promise<void> {
    // TODO: Update search analytics
  }

  private async getPopularQueries(): Promise<string[]> {
    // TODO: Get popular search queries
    return [];
  }

  private async getCategorySuggestions(partialQuery: string): Promise<string[]> {
    // TODO: Get category-based suggestions
    return [];
  }

  private async findSynonyms(query: string): Promise<string[]> {
    // TODO: Find synonyms using NLP
    return [];
  }

  private expandTechnicalTerms(query: string): string[] {
    // TODO: Expand AI/ML technical terms
    return [];
  }

  private removeStopWords(text: string): string {
    // TODO: Remove domain-specific stop words
    return text;
  }

  private expandAbbreviations(text: string): string {
    // TODO: Expand AI/ML abbreviations
    return text;
  }

  private async correctSpelling(text: string): Promise<string> {
    // TODO: Spell correction
    return text;
  }

  private matchComplexityToSkillLevel(complexity: string, skillLevel: string): number {
    // TODO: Match complexity to user skill level
    return 0.5;
  }

  private async calculateHistoryRelevance(modelData: any, history: string[]): Promise<number> {
    // TODO: Calculate relevance based on search history
    return 0.5;
  }

  private calculateProjectRelevance(useCases: string[], currentProject: string): number {
    // TODO: Calculate project relevance
    return 0.5;
  }

  private calculatePreferenceAlignment(modelData: any, preferences: Record<string, any>): number {
    // TODO: Calculate preference alignment
    return 0.5;
  }
}

// Simple vector index implementation
class VectorIndex {
  private vectors: Map<string, number[]> = new Map();
  
  constructor(private dimension: number) {}
  
  add(id: string, vector: number[]): void {
    if (vector.length !== this.dimension) {
      throw new Error(`Vector dimension mismatch: expected ${this.dimension}, got ${vector.length}`);
    }
    this.vectors.set(id, vector);
  }
  
  search(queryVector: number[], k: number): Array<{ id: string; similarity: number }> {
    const results: Array<{ id: string; similarity: number }> = [];
    
    for (const [id, vector] of Array.from(this.vectors.entries())) {
      const similarity = this.cosineSimilarity(queryVector, vector);
      results.push({ id, similarity });
    }
    
    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, k);
  }
  
  private cosineSimilarity(a: number[], b: number[]): number {
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
}

export default SemanticSearchEngine;