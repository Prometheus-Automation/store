/**
 * Intelligent Queue Management System
 * Advanced request prioritization, load balancing, and resource optimization
 * Real-time monitoring and adaptive queue strategies
 */

interface QueueRequest {
  id: string;
  userId: string;
  type: 'ai-model' | 'search' | 'recommendation' | 'pricing' | 'benchmark';
  priority: 'critical' | 'high' | 'medium' | 'low';
  payload: any;
  timestamp: Date;
  estimatedDuration: number; // milliseconds
  resourceRequirements: {
    cpu: number; // 0-1 scale
    memory: number; // MB
    gpu?: boolean;
    tokens?: number;
  };
  retryCount: number;
  maxRetries: number;
  deadline?: Date;
  userTier: 'free' | 'premium' | 'enterprise';
}

interface QueueWorker {
  id: string;
  type: string;
  status: 'idle' | 'busy' | 'maintenance';
  currentRequest?: string;
  capabilities: string[];
  performance: {
    avgProcessingTime: number;
    successRate: number;
    lastProcessed: Date;
  };
  resources: {
    maxCpu: number;
    maxMemory: number;
    hasGpu: boolean;
  };
}

interface QueueMetrics {
  timestamp: Date;
  totalRequests: number;
  processed: number;
  failed: number;
  avgWaitTime: number;
  avgProcessingTime: number;
  throughput: number; // requests per minute
  resourceUtilization: {
    cpu: number;
    memory: number;
    gpu: number;
  };
  queueLengths: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

interface LoadBalancingStrategy {
  name: 'round-robin' | 'least-connections' | 'weighted-response-time' | 'resource-aware';
  weights?: Record<string, number>;
  config?: any;
}

export class QueueService {
  private queues: Map<string, QueueRequest[]> = new Map();
  private workers: Map<string, QueueWorker> = new Map();
  private processingRequests: Map<string, QueueRequest> = new Map();
  private metrics: QueueMetrics[] = [];
  private loadBalancingStrategy: LoadBalancingStrategy = { name: 'resource-aware' };
  
  // Rate limiting
  private rateLimits: Map<string, { count: number; resetTime: Date }> = new Map();
  private userQuotas: Map<string, { used: number; limit: number; resetTime: Date }> = new Map();
  
  // Circuit breaker
  private circuitBreakers: Map<string, {
    state: 'closed' | 'open' | 'half-open';
    failures: number;
    lastFailure: Date;
    threshold: number;
  }> = new Map();

  constructor() {
    this.initializeQueues();
    this.initializeWorkers();
    this.startMetricsCollection();
    this.startQueueProcessor();
  }

  /**
   * Add request to intelligent queue with priority scoring
   */
  async enqueue(request: Omit<QueueRequest, 'id' | 'timestamp' | 'retryCount'>): Promise<{
    id: string;
    estimatedWaitTime: number;
    position: number;
  }> {
    // Generate unique request ID
    const id = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Rate limiting check
    await this.checkRateLimit(request.userId, request.userTier);
    
    // Circuit breaker check
    await this.checkCircuitBreaker(request.type);
    
    // Calculate dynamic priority
    const dynamicPriority = await this.calculateDynamicPriority(request);
    
    const queueRequest: QueueRequest = {
      ...request,
      id,
      timestamp: new Date(),
      retryCount: 0,
      priority: dynamicPriority
    };

    // Add to appropriate queue
    const queueKey = this.getQueueKey(queueRequest);
    if (!this.queues.has(queueKey)) {
      this.queues.set(queueKey, []);
    }
    
    const queue = this.queues.get(queueKey)!;
    
    // Insert with priority ordering
    const insertIndex = this.findInsertPosition(queue, queueRequest);
    queue.splice(insertIndex, 0, queueRequest);
    
    // Calculate position and estimated wait time
    const position = insertIndex + 1;
    const estimatedWaitTime = await this.calculateWaitTime(queueRequest, position);
    
    console.log(`Request ${id} queued at position ${position} with priority ${dynamicPriority}`);
    
    return {
      id,
      estimatedWaitTime,
      position
    };
  }

  /**
   * Get real-time queue status
   */
  async getQueueStatus(): Promise<{
    queues: Record<string, {
      length: number;
      avgWaitTime: number;
      oldestRequest: Date | null;
    }>;
    workers: {
      total: number;
      idle: number;
      busy: number;
      maintenance: number;
    };
    metrics: QueueMetrics;
    health: 'healthy' | 'degraded' | 'critical';
  }> {
    const queueStatus: Record<string, any> = {};
    
    for (const [key, queue] of Array.from(this.queues.entries())) {
      queueStatus[key] = {
        length: queue.length,
        avgWaitTime: await this.calculateAverageWaitTime(key),
        oldestRequest: queue.length > 0 ? queue[0].timestamp : null
      };
    }
    
    const workerStats = {
      total: this.workers.size,
      idle: Array.from(this.workers.values()).filter(w => w.status === 'idle').length,
      busy: Array.from(this.workers.values()).filter(w => w.status === 'busy').length,
      maintenance: Array.from(this.workers.values()).filter(w => w.status === 'maintenance').length
    };
    
    const latestMetrics = this.metrics[this.metrics.length - 1] || this.createEmptyMetrics();
    const health = this.calculateSystemHealth();
    
    return {
      queues: queueStatus,
      workers: workerStats,
      metrics: latestMetrics,
      health
    };
  }

  /**
   * Get request status and position
   */
  async getRequestStatus(requestId: string): Promise<{
    status: 'queued' | 'processing' | 'completed' | 'failed' | 'not-found';
    position?: number;
    estimatedWaitTime?: number;
    result?: any;
    error?: string;
  }> {
    // Check if processing
    if (this.processingRequests.has(requestId)) {
      return { status: 'processing' };
    }
    
    // Check queues
    for (const [queueKey, queue] of Array.from(this.queues.entries())) {
      const position = queue.findIndex((req: QueueRequest) => req.id === requestId);
      if (position >= 0) {
        const request = queue[position];
        const estimatedWaitTime = await this.calculateWaitTime(request, position + 1);
        
        return {
          status: 'queued',
          position: position + 1,
          estimatedWaitTime
        };
      }
    }
    
    return { status: 'not-found' };
  }

  /**
   * Cancel request from queue
   */
  async cancelRequest(requestId: string, userId: string): Promise<boolean> {
    // Check if user owns the request
    for (const [queueKey, queue] of Array.from(this.queues.entries())) {
      const index = queue.findIndex((req: QueueRequest) => req.id === requestId && req.userId === userId);
      if (index >= 0) {
        queue.splice(index, 1);
        console.log(`Request ${requestId} cancelled by user ${userId}`);
        return true;
      }
    }
    
    return false;
  }

  /**
   * Update load balancing strategy
   */
  async updateLoadBalancingStrategy(strategy: LoadBalancingStrategy): Promise<void> {
    this.loadBalancingStrategy = strategy;
    console.log(`Load balancing strategy updated to: ${strategy.name}`);
  }

  /**
   * Get performance analytics
   */
  async getAnalytics(period: 'hour' | 'day' | 'week' = 'hour'): Promise<{
    throughput: {
      current: number;
      average: number;
      peak: number;
    };
    latency: {
      p50: number;
      p95: number;
      p99: number;
    };
    success_rate: number;
    queue_efficiency: number;
    resource_utilization: {
      cpu: number;
      memory: number;
      gpu: number;
    };
    trends: {
      timestamp: Date;
      throughput: number;
      latency: number;
      queue_length: number;
    }[];
    bottlenecks: string[];
    recommendations: string[];
  }> {
    const periodMs = this.getPeriodMs(period);
    const relevantMetrics = this.metrics.filter(
      m => Date.now() - m.timestamp.getTime() < periodMs
    );
    
    if (relevantMetrics.length === 0) {
      return this.getEmptyAnalytics();
    }
    
    // Calculate throughput statistics
    const throughputs = relevantMetrics.map(m => m.throughput);
    const currentThroughput = throughputs[throughputs.length - 1] || 0;
    const avgThroughput = throughputs.reduce((a, b) => a + b, 0) / throughputs.length;
    const peakThroughput = Math.max(...throughputs);
    
    // Calculate latency percentiles
    const waitTimes = relevantMetrics.map(m => m.avgWaitTime);
    const latencyPercentiles = this.calculatePercentiles(waitTimes);
    
    // Calculate success rate
    const totalProcessed = relevantMetrics.reduce((sum, m) => sum + m.processed, 0);
    const totalFailed = relevantMetrics.reduce((sum, m) => sum + m.failed, 0);
    const successRate = totalProcessed / (totalProcessed + totalFailed) || 1;
    
    // Calculate queue efficiency
    const avgProcessingTime = relevantMetrics.reduce((sum, m) => sum + m.avgProcessingTime, 0) / relevantMetrics.length;
    const avgWaitTime = relevantMetrics.reduce((sum, m) => sum + m.avgWaitTime, 0) / relevantMetrics.length;
    const queueEfficiency = avgProcessingTime / (avgProcessingTime + avgWaitTime);
    
    // Resource utilization
    const avgCpu = relevantMetrics.reduce((sum, m) => sum + m.resourceUtilization.cpu, 0) / relevantMetrics.length;
    const avgMemory = relevantMetrics.reduce((sum, m) => sum + m.resourceUtilization.memory, 0) / relevantMetrics.length;
    const avgGpu = relevantMetrics.reduce((sum, m) => sum + m.resourceUtilization.gpu, 0) / relevantMetrics.length;
    
    // Trends
    const trends = relevantMetrics.map(m => ({
      timestamp: m.timestamp,
      throughput: m.throughput,
      latency: m.avgWaitTime,
      queue_length: m.totalRequests - m.processed
    }));
    
    // Identify bottlenecks and recommendations
    const bottlenecks = await this.identifyBottlenecks(relevantMetrics);
    const recommendations = await this.generateRecommendations(relevantMetrics, bottlenecks);
    
    return {
      throughput: {
        current: currentThroughput,
        average: avgThroughput,
        peak: peakThroughput
      },
      latency: {
        p50: latencyPercentiles.p50,
        p95: latencyPercentiles.p95,
        p99: latencyPercentiles.p99
      },
      success_rate: successRate,
      queue_efficiency: queueEfficiency,
      resource_utilization: {
        cpu: avgCpu,
        memory: avgMemory,
        gpu: avgGpu
      },
      trends,
      bottlenecks,
      recommendations
    };
  }

  /**
   * Auto-scale workers based on demand
   */
  async autoScale(): Promise<{
    action: 'scale-up' | 'scale-down' | 'maintain';
    workers_added?: number;
    workers_removed?: number;
    reason: string;
  }> {
    const status = await this.getQueueStatus();
    const analytics = await this.getAnalytics('hour');
    
    const totalQueueLength = Object.values(status.queues).reduce((sum, q) => sum + q.length, 0);
    const avgWaitTime = analytics.latency.p95;
    const cpuUtilization = analytics.resource_utilization.cpu;
    
    // Scale up conditions
    if (totalQueueLength > 50 && avgWaitTime > 30000) { // 30 seconds
      const workersToAdd = Math.ceil(totalQueueLength / 25);
      await this.addWorkers(workersToAdd);
      return {
        action: 'scale-up',
        workers_added: workersToAdd,
        reason: `High queue length (${totalQueueLength}) and wait time (${avgWaitTime}ms)`
      };
    }
    
    if (cpuUtilization > 0.8) {
      const workersToAdd = Math.ceil(this.workers.size * 0.2);
      await this.addWorkers(workersToAdd);
      return {
        action: 'scale-up',
        workers_added: workersToAdd,
        reason: `High CPU utilization (${Math.round(cpuUtilization * 100)}%)`
      };
    }
    
    // Scale down conditions
    if (totalQueueLength < 5 && avgWaitTime < 5000 && cpuUtilization < 0.3) {
      const workersToRemove = Math.floor(this.workers.size * 0.1);
      if (workersToRemove > 0 && this.workers.size - workersToRemove >= 2) {
        await this.removeWorkers(workersToRemove);
        return {
          action: 'scale-down',
          workers_removed: workersToRemove,
          reason: `Low demand: queue(${totalQueueLength}), wait(${avgWaitTime}ms), CPU(${Math.round(cpuUtilization * 100)}%)`
        };
      }
    }
    
    return {
      action: 'maintain',
      reason: 'Current capacity is optimal'
    };
  }

  // Private implementation methods

  private initializeQueues(): void {
    const queueTypes = ['critical', 'high', 'medium', 'low'];
    const requestTypes = ['ai-model', 'search', 'recommendation', 'pricing', 'benchmark'];
    
    for (const priority of queueTypes) {
      for (const type of requestTypes) {
        this.queues.set(`${priority}-${type}`, []);
      }
    }
  }

  private initializeWorkers(): void {
    // Create default workers
    const workerConfigs = [
      { id: 'ai-worker-1', type: 'ai-model', capabilities: ['gpt', 'claude', 'llama'], hasGpu: true },
      { id: 'ai-worker-2', type: 'ai-model', capabilities: ['gpt', 'claude'], hasGpu: true },
      { id: 'search-worker-1', type: 'search', capabilities: ['semantic', 'vector'], hasGpu: false },
      { id: 'rec-worker-1', type: 'recommendation', capabilities: ['collaborative', 'content'], hasGpu: false },
      { id: 'pricing-worker-1', type: 'pricing', capabilities: ['ml', 'optimization'], hasGpu: false }
    ];

    for (const config of workerConfigs) {
      this.workers.set(config.id, {
        id: config.id,
        type: config.type,
        status: 'idle',
        capabilities: config.capabilities,
        performance: {
          avgProcessingTime: 1000,
          successRate: 0.95,
          lastProcessed: new Date()
        },
        resources: {
          maxCpu: 0.8,
          maxMemory: 2048,
          hasGpu: config.hasGpu
        }
      });
    }
  }

  private startMetricsCollection(): void {
    setInterval(() => {
      this.collectMetrics();
    }, 60000); // Every minute
  }

  private startQueueProcessor(): void {
    setInterval(() => {
      this.processQueues();
    }, 1000); // Every second
  }

  private async calculateDynamicPriority(request: Omit<QueueRequest, 'id' | 'timestamp' | 'retryCount'>): Promise<'critical' | 'high' | 'medium' | 'low'> {
    let score = 0;
    
    // Base priority score
    const priorityScores = { critical: 100, high: 75, medium: 50, low: 25 };
    score += priorityScores[request.priority];
    
    // User tier boost
    const tierBoosts = { enterprise: 30, premium: 15, free: 0 };
    score += tierBoosts[request.userTier];
    
    // Deadline urgency
    if (request.deadline) {
      const timeToDeadline = request.deadline.getTime() - Date.now();
      const urgencyBoost = Math.max(0, 50 - (timeToDeadline / 60000)); // Boost based on minutes to deadline
      score += urgencyBoost;
    }
    
    // Request type priority
    const typeBoosts = { 'ai-model': 20, 'search': 15, 'recommendation': 10, 'pricing': 10, 'benchmark': 5 };
    score += typeBoosts[request.type] || 0;
    
    // Convert score back to priority level
    if (score >= 90) return 'critical';
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  private getQueueKey(request: QueueRequest): string {
    return `${request.priority}-${request.type}`;
  }

  private findInsertPosition(queue: QueueRequest[], request: QueueRequest): number {
    // Priority ordering: critical > high > medium > low
    // Within same priority: FIFO (first in, first out)
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    const requestPriorityLevel = priorityOrder[request.priority];
    
    for (let i = 0; i < queue.length; i++) {
      const queueItemPriorityLevel = priorityOrder[queue[i].priority];
      if (requestPriorityLevel < queueItemPriorityLevel) {
        return i;
      }
    }
    
    return queue.length;
  }

  private async calculateWaitTime(request: QueueRequest, position: number): Promise<number> {
    const queueKey = this.getQueueKey(request);
    const avgProcessingTime = await this.getAverageProcessingTime(request.type);
    const workersForType = Array.from(this.workers.values()).filter(w => w.type === request.type && w.status !== 'maintenance');
    
    if (workersForType.length === 0) return 300000; // 5 minutes default
    
    const estimatedProcessingTime = avgProcessingTime * request.resourceRequirements.cpu;
    const parallelCapacity = workersForType.length;
    
    return Math.ceil((position / parallelCapacity) * estimatedProcessingTime);
  }

  private async checkRateLimit(userId: string, userTier: string): Promise<void> {
    const limits = {
      free: { requests: 10, window: 60000 }, // 10 requests per minute
      premium: { requests: 100, window: 60000 }, // 100 requests per minute
      enterprise: { requests: 1000, window: 60000 } // 1000 requests per minute
    };
    
    const limit = limits[userTier as keyof typeof limits] || limits.free;
    const now = new Date();
    
    const userLimit = this.rateLimits.get(userId);
    if (!userLimit || now >= userLimit.resetTime) {
      // Reset or initialize
      this.rateLimits.set(userId, {
        count: 1,
        resetTime: new Date(now.getTime() + limit.window)
      });
      return;
    }
    
    if (userLimit.count >= limit.requests) {
      throw new Error(`Rate limit exceeded. Try again in ${Math.ceil((userLimit.resetTime.getTime() - now.getTime()) / 1000)} seconds`);
    }
    
    userLimit.count++;
  }

  private async checkCircuitBreaker(requestType: string): Promise<void> {
    const breaker = this.circuitBreakers.get(requestType);
    if (!breaker) {
      this.circuitBreakers.set(requestType, {
        state: 'closed',
        failures: 0,
        lastFailure: new Date(),
        threshold: 5
      });
      return;
    }
    
    if (breaker.state === 'open') {
      const timeSinceLastFailure = Date.now() - breaker.lastFailure.getTime();
      if (timeSinceLastFailure > 60000) { // 1 minute cooldown
        breaker.state = 'half-open';
      } else {
        throw new Error(`Service temporarily unavailable for ${requestType}. Circuit breaker is open.`);
      }
    }
  }

  private async processQueues(): Promise<void> {
    for (const [queueKey, queue] of Array.from(this.queues.entries())) {
      if (queue.length === 0) continue;
      
      const [priority, type] = queueKey.split('-');
      const availableWorkers = Array.from(this.workers.values()).filter(
        w => w.type === type && w.status === 'idle'
      );
      
      if (availableWorkers.length === 0) continue;
      
      // Get next request
      const request = queue.shift();
      if (!request) continue;
      
      // Select best worker using load balancing strategy
      const selectedWorker = await this.selectWorker(availableWorkers, request);
      if (!selectedWorker) {
        // Put request back
        queue.unshift(request);
        continue;
      }
      
      // Start processing
      await this.processRequest(request, selectedWorker);
    }
  }

  private async selectWorker(workers: QueueWorker[], request: QueueRequest): Promise<QueueWorker | null> {
    switch (this.loadBalancingStrategy.name) {
      case 'round-robin':
        return workers[0]; // Simplified round-robin
        
      case 'least-connections':
        return workers.reduce((best, worker) => 
          worker.performance.avgProcessingTime < best.performance.avgProcessingTime ? worker : best
        );
        
      case 'weighted-response-time':
        return workers.reduce((best, worker) => {
          const score = 1 / worker.performance.avgProcessingTime * worker.performance.successRate;
          const bestScore = 1 / best.performance.avgProcessingTime * best.performance.successRate;
          return score > bestScore ? worker : best;
        });
        
      case 'resource-aware':
      default:
        // Select worker with best resource match
        return workers.find(worker => 
          worker.resources.maxCpu >= request.resourceRequirements.cpu &&
          worker.resources.maxMemory >= request.resourceRequirements.memory &&
          (!request.resourceRequirements.gpu || worker.resources.hasGpu)
        ) || workers[0];
    }
  }

  private async processRequest(request: QueueRequest, worker: QueueWorker): Promise<void> {
    try {
      worker.status = 'busy';
      worker.currentRequest = request.id;
      this.processingRequests.set(request.id, request);
      
      console.log(`Processing request ${request.id} with worker ${worker.id}`);
      
      const startTime = Date.now();
      
      // Simulate processing (in real implementation, this would call the actual service)
      await this.executeRequest(request);
      
      const processingTime = Date.now() - startTime;
      
      // Update worker performance metrics
      worker.performance.avgProcessingTime = 
        (worker.performance.avgProcessingTime * 0.9) + (processingTime * 0.1);
      worker.performance.successRate = 
        (worker.performance.successRate * 0.95) + (0.05);
      worker.performance.lastProcessed = new Date();
      
      // Reset circuit breaker on success
      const breaker = this.circuitBreakers.get(request.type);
      if (breaker) {
        breaker.failures = 0;
        breaker.state = 'closed';
      }
      
    } catch (error) {
      console.error(`Request ${request.id} failed:`, error);
      
      // Update circuit breaker
      const breaker = this.circuitBreakers.get(request.type);
      if (breaker) {
        breaker.failures++;
        breaker.lastFailure = new Date();
        if (breaker.failures >= breaker.threshold) {
          breaker.state = 'open';
        }
      }
      
      // Retry logic
      if (request.retryCount < request.maxRetries) {
        request.retryCount++;
        const retryQueueKey = this.getQueueKey(request);
        const retryQueue = this.queues.get(retryQueueKey);
        if (retryQueue) {
          retryQueue.push(request);
        }
      }
      
    } finally {
      worker.status = 'idle';
      worker.currentRequest = undefined;
      this.processingRequests.delete(request.id);
    }
  }

  private async executeRequest(request: QueueRequest): Promise<any> {
    // Simulate processing time based on request type and complexity
    const baseTime = {
      'ai-model': 2000,
      'search': 500,
      'recommendation': 1000,
      'pricing': 800,
      'benchmark': 5000
    };
    
    const processingTime = (baseTime[request.type] || 1000) * request.resourceRequirements.cpu;
    
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // Simulate occasional failures
    if (Math.random() < 0.05) { // 5% failure rate
      throw new Error('Processing failed');
    }
    
    return { success: true, data: 'mock result' };
  }

  private collectMetrics(): void {
    const now = new Date();
    const totalRequests = Array.from(this.queues.values()).reduce((sum, queue) => sum + queue.length, 0);
    const processingCount = this.processingRequests.size;
    
    // Calculate resource utilization
    const busyWorkers = Array.from(this.workers.values()).filter(w => w.status === 'busy').length;
    const totalWorkers = this.workers.size;
    const cpuUtilization = totalWorkers > 0 ? busyWorkers / totalWorkers : 0;
    
    const metrics: QueueMetrics = {
      timestamp: now,
      totalRequests,
      processed: processingCount,
      failed: 0, // Would track actual failures
      avgWaitTime: 0, // Would calculate from queue times
      avgProcessingTime: 1500, // Would calculate from worker metrics
      throughput: 0, // Would calculate requests per minute
      resourceUtilization: {
        cpu: cpuUtilization,
        memory: 0.6, // Would get from system monitoring
        gpu: 0.4 // Would get from GPU monitoring
      },
      queueLengths: {
        critical: this.getQueueLengthByPriority('critical'),
        high: this.getQueueLengthByPriority('high'),
        medium: this.getQueueLengthByPriority('medium'),
        low: this.getQueueLengthByPriority('low')
      }
    };
    
    this.metrics.push(metrics);
    
    // Keep only last 24 hours of metrics
    const cutoff = now.getTime() - (24 * 60 * 60 * 1000);
    this.metrics = this.metrics.filter(m => m.timestamp.getTime() > cutoff);
  }

  private getQueueLengthByPriority(priority: string): number {
    let total = 0;
    for (const [key, queue] of Array.from(this.queues.entries())) {
      if (key.startsWith(priority)) {
        total += queue.length;
      }
    }
    return total;
  }

  private calculateSystemHealth(): 'healthy' | 'degraded' | 'critical' {
    const latestMetrics = this.metrics[this.metrics.length - 1];
    if (!latestMetrics) return 'healthy';
    
    const totalQueueLength = Object.values(latestMetrics.queueLengths).reduce((a, b) => a + b, 0);
    const cpuUtilization = latestMetrics.resourceUtilization.cpu;
    
    if (totalQueueLength > 100 || cpuUtilization > 0.9) return 'critical';
    if (totalQueueLength > 50 || cpuUtilization > 0.7) return 'degraded';
    return 'healthy';
  }

  private createEmptyMetrics(): QueueMetrics {
    return {
      timestamp: new Date(),
      totalRequests: 0,
      processed: 0,
      failed: 0,
      avgWaitTime: 0,
      avgProcessingTime: 0,
      throughput: 0,
      resourceUtilization: { cpu: 0, memory: 0, gpu: 0 },
      queueLengths: { critical: 0, high: 0, medium: 0, low: 0 }
    };
  }

  private async getAverageProcessingTime(requestType: string): Promise<number> {
    const workersOfType = Array.from(this.workers.values()).filter(w => w.type === requestType);
    if (workersOfType.length === 0) return 1000;
    
    const avgTime = workersOfType.reduce((sum, w) => sum + w.performance.avgProcessingTime, 0) / workersOfType.length;
    return avgTime;
  }

  private async calculateAverageWaitTime(queueKey: string): Promise<number> {
    // Would calculate from historical data
    return 5000; // 5 seconds placeholder
  }

  private getPeriodMs(period: string): number {
    const periods = {
      hour: 3600000,
      day: 86400000,
      week: 604800000
    };
    return periods[period as keyof typeof periods] || periods.hour;
  }

  private getEmptyAnalytics(): any {
    return {
      throughput: { current: 0, average: 0, peak: 0 },
      latency: { p50: 0, p95: 0, p99: 0 },
      success_rate: 1,
      queue_efficiency: 1,
      resource_utilization: { cpu: 0, memory: 0, gpu: 0 },
      trends: [],
      bottlenecks: [],
      recommendations: []
    };
  }

  private calculatePercentiles(values: number[]): { p50: number; p95: number; p99: number } {
    if (values.length === 0) return { p50: 0, p95: 0, p99: 0 };
    
    const sorted = values.slice().sort((a, b) => a - b);
    return {
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  private async identifyBottlenecks(metrics: QueueMetrics[]): Promise<string[]> {
    const bottlenecks: string[] = [];
    const latest = metrics[metrics.length - 1];
    
    if (latest.resourceUtilization.cpu > 0.8) {
      bottlenecks.push('High CPU utilization');
    }
    
    if (latest.resourceUtilization.memory > 0.85) {
      bottlenecks.push('High memory usage');
    }
    
    const totalQueueLength = Object.values(latest.queueLengths).reduce((a, b) => a + b, 0);
    if (totalQueueLength > 50) {
      bottlenecks.push('Queue backlog building up');
    }
    
    return bottlenecks;
  }

  private async generateRecommendations(metrics: QueueMetrics[], bottlenecks: string[]): Promise<string[]> {
    const recommendations: string[] = [];
    
    if (bottlenecks.includes('High CPU utilization')) {
      recommendations.push('Consider scaling up workers or optimizing processing algorithms');
    }
    
    if (bottlenecks.includes('High memory usage')) {
      recommendations.push('Implement memory optimization or increase worker memory limits');
    }
    
    if (bottlenecks.includes('Queue backlog building up')) {
      recommendations.push('Enable auto-scaling or add more workers during peak hours');
    }
    
    return recommendations;
  }

  private async addWorkers(count: number): Promise<void> {
    for (let i = 0; i < count; i++) {
      const workerId = `auto-worker-${Date.now()}-${i}`;
      this.workers.set(workerId, {
        id: workerId,
        type: 'ai-model', // Default type
        status: 'idle',
        capabilities: ['gpt', 'claude'],
        performance: {
          avgProcessingTime: 1000,
          successRate: 0.95,
          lastProcessed: new Date()
        },
        resources: {
          maxCpu: 0.8,
          maxMemory: 2048,
          hasGpu: false
        }
      });
    }
    
    console.log(`Added ${count} workers for auto-scaling`);
  }

  private async removeWorkers(count: number): Promise<void> {
    const idleWorkers = Array.from(this.workers.entries())
      .filter(([_, worker]) => worker.status === 'idle')
      .slice(0, count);
    
    for (const [workerId] of idleWorkers) {
      this.workers.delete(workerId);
    }
    
    console.log(`Removed ${idleWorkers.length} idle workers for auto-scaling`);
  }
}

export default QueueService;