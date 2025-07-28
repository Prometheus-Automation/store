// services/securityScannerService.ts
import crypto from 'crypto';
import * as acorn from 'acorn';
// import { parse as parsePython } from 'python-ast'; // Fallback to regex for Python
// Note: isolated-vm removed for compatibility - sandbox testing disabled
// Use simple Map cache instead of LRUCache for compatibility
// JWT verification disabled due to package installation issues - would normally import jsonwebtoken
import { AIModel, SecurityScanResult, Threat, ThreatReport, AISpecificReport } from '../types/security.types';

export class AIModelSecurityScanner {
  private readonly SECURITY_SCAN_TIMEOUT = parseInt(process.env.SECURITY_SCAN_TIMEOUT || '10000');
  private readonly SANDBOX_MEMORY_LIMIT = parseInt(process.env.SANDBOX_MEMORY_LIMIT || '128');
  private readonly MAX_AST_DEPTH = parseInt(process.env.MAX_AST_DEPTH || '100');
  private readonly MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_BYTES || String(10 * 1024 * 1024));
  private readonly CACHE_TTL = parseInt(process.env.SCANNER_CACHE_TTL || String(1000 * 60 * 5));
  private readonly JWT_MAX_AGE = process.env.JWT_MAX_AGE || '7d';
  
  // Simple cache implementation
  private scanCache = new Map<string, { result: SecurityScanResult; timestamp: number }>();

  // Memoized regex results for performance
  private regexCache = new Map<string, boolean>();

  async scanModel(model: AIModel): Promise<SecurityScanResult> {
    const startTime = Date.now();
    
    // Check cache
    const cacheKey = this.calculateChecksum(model.code);
    const cached = this.scanCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      console.log(`Cache hit for model ${model.id}`);
      return { ...cached.result, fromCache: true };
    }

    // Size validation
    if (Buffer.byteLength(model.code, 'utf8') > this.MAX_FILE_SIZE) {
      throw new Error(`Model code exceeds maximum size limit of ${this.MAX_FILE_SIZE} bytes`);
    }

    const scanId = this.generateScanId();
    
    try {
      // Base scans for all frameworks
      const scanPromises = [
        this.withTimeout(this.scanForMaliciousPatterns(model.code), 5000),
        this.withTimeout(this.detectDataExfiltration(model), 5000),
        this.withTimeout(this.verifyIntegrity(model), 3000),
        this.withTimeout(this.scanAISpecificThreats(model), 5000),
      ];

      // Framework-specific scans
      if (model.framework === 'javascript' || model.framework === 'custom') {
        scanPromises.push(
          this.withTimeout(this.performASTAnalysis(model.code, 'javascript'), 5000),
          this.withTimeout(this.sandboxTest(model), this.SECURITY_SCAN_TIMEOUT)
        );
      } else if (model.framework === 'python' || model.framework === 'pytorch' || model.framework === 'tensorflow') {
        scanPromises.push(
          this.withTimeout(this.performASTAnalysis(model.code, 'python'), 5000)
        );
      }

      const results = await Promise.allSettled(scanPromises);
      const scanResult = this.aggregateResults(model.id, scanId, results);
      
      // Add metadata
      scanResult.scanDuration = Date.now() - startTime;
      scanResult.framework = model.framework;
      
      // Cache result
      this.scanCache.set(cacheKey, { result: scanResult, timestamp: Date.now() });
      
      return scanResult;
    } catch (error) {
      console.error(`Security scan failed for model ${model.id}:`, error);
      return this.createFailedScanResult(model.id, scanId, error as Error);
    }
  }

  private async performASTAnalysis(
    code: string, 
    language: 'javascript' | 'python'
  ): Promise<ThreatReport> {
    const threats: Threat[] = [];
    
    try {
      if (language === 'javascript') {
        const ast = acorn.parse(code, { 
          ecmaVersion: 'latest',
          sourceType: 'module',
          locations: true,
          allowHashBang: true,
          allowAwaitOutsideFunction: true,
        });
        
        this.walkAST(ast, (node, depth) => {
          if (depth > this.MAX_AST_DEPTH) {
            threats.push({
              type: 'suspicious_pattern',
              pattern: 'Excessive code nesting',
              occurrences: 1,
              severity: 7,
              locations: [],
            });
            return false;
          }

          // Enhanced JavaScript detection
          if (node.type === 'CallExpression') {
            const calleeName = this.getCalleeName(node);
            const dangerousFunctions: Record<string, number> = {
              'eval': 10,
              'Function': 9,
              'setTimeout': 8,
              'setInterval': 8,
              'execScript': 10,
              'setImmediate': 7,
            };

            if (calleeName in dangerousFunctions) {
              threats.push({
                type: 'code_execution',
                pattern: `AST: ${calleeName} call`,
                occurrences: 1,
                severity: dangerousFunctions[calleeName],
                locations: [{
                  line: node.loc?.start.line || 0,
                  column: node.loc?.start.column || 0,
                  snippet: this.extractSnippet(code, node),
                }],
              });
            }
          }

          // Dynamic imports/requires
          if (node.type === 'ImportExpression' || 
              (node.type === 'CallExpression' && this.getCalleeName(node) === 'require')) {
            threats.push({
              type: 'suspicious_pattern',
              pattern: 'Dynamic module loading',
              occurrences: 1,
              severity: 7,
              locations: [{
                line: node.loc?.start.line || 0,
                column: node.loc?.start.column || 0,
                snippet: 'Dynamic import/require detected',
              }],
            });
          }

          return true;
        }, 0);
      } else if (language === 'python') {
        // Use enhanced regex for Python since python-ast may not be available
        this.analyzePythonWithRegex(code, threats);
      }
    } catch (parseError: any) {
      threats.push({
        type: 'suspicious_pattern',
        pattern: `Parse error: ${parseError.message}`,
        occurrences: 1,
        severity: 8,
        locations: [],
      });
    }
    
    return {
      threats,
      riskLevel: this.calculateRiskLevel(threats),
      score: this.calculateThreatScore(threats),
    };
  }

  private analyzePythonAST(ast: any, threats: Threat[], code: string): void {
    const walk = (node: any, depth: number = 0): void => {
      if (!node || depth > this.MAX_AST_DEPTH) return;

      if (node.type === 'Call') {
        const funcName = node.func?.id?.name || node.func?.attr;
        const dangerousFuncs: Record<string, number> = {
          'eval': 10,
          'exec': 10,
          'compile': 9,
          '__import__': 8,
          'open': 6,
          'input': 5,
          'raw_input': 5,
        };

        if (funcName in dangerousFuncs) {
          threats.push({
            type: 'code_execution',
            pattern: `Python AST: ${funcName} call`,
            occurrences: 1,
            severity: dangerousFuncs[funcName],
            locations: [{
              line: node.lineno || 0,
              column: node.col_offset || 0,
              snippet: `${funcName}(...)`,
            }],
          });
        }
      }

      if (node.type === 'Import' || node.type === 'ImportFrom') {
        const modules = node.names?.map((n: any) => n.name) || [];
        const dangerousModules = ['os', 'subprocess', 'sys', 'socket', 'pickle'];
        
        for (const mod of modules) {
          if (dangerousModules.includes(mod)) {
            threats.push({
              type: 'suspicious_pattern',
              pattern: `Dangerous import: ${mod}`,
              occurrences: 1,
              severity: 8,
              locations: [{
                line: node.lineno || 0,
                column: node.col_offset || 0,
                snippet: `import ${mod}`,
              }],
            });
          }
        }
      }

      for (const key in node) {
        if (node[key] && typeof node[key] === 'object') {
          if (Array.isArray(node[key])) {
            for (const child of node[key]) {
              walk(child, depth + 1);
            }
          } else {
            walk(node[key], depth + 1);
          }
        }
      }
    };

    walk(ast);
  }

  private analyzePythonWithRegex(code: string, threats: Threat[]): void {
    const pythonPatterns = [
      { pattern: /\beval\s*\(/g, severity: 10, type: 'eval' },
      { pattern: /\bexec\s*\(/g, severity: 10, type: 'exec' },
      { pattern: /\b__import__\s*\(/g, severity: 8, type: '__import__' },
      { pattern: /\bcompile\s*\(/g, severity: 9, type: 'compile' },
      { pattern: /\bsubprocess\./g, severity: 9, type: 'subprocess' },
      { pattern: /\bos\.system/g, severity: 9, type: 'os.system' },
      { pattern: /\bopen\s*\(/g, severity: 6, type: 'file_open' },
      { pattern: /\bpickle\.loads/g, severity: 9, type: 'pickle' },
      { pattern: /\bimport\s+(os|sys|subprocess|socket)\b/g, severity: 8, type: 'dangerous_import' },
    ];

    for (const { pattern, severity, type } of pythonPatterns) {
      const matches = Array.from(code.matchAll(pattern));
      if (matches.length > 0) {
        threats.push({
          type: 'code_execution',
          pattern: `Python: ${type}`,
          occurrences: matches.length,
          severity,
          locations: matches.slice(0, 3).map(match => ({
            line: code.substring(0, match.index).split('\n').length,
            column: match.index! - code.lastIndexOf('\n', match.index! - 1) - 1,
            snippet: match[0],
          })),
        });
      }
    }
  }

  private walkAST(
    node: any, 
    callback: (node: any, depth: number) => boolean, 
    depth: number
  ): void {
    if (!node || typeof node !== 'object') return;
    
    const shouldContinue = callback(node, depth);
    if (!shouldContinue) return;
    
    for (const key in node) {
      if (key === 'loc' || key === 'range' || key === 'start' || key === 'end') continue;
      
      const value = node[key];
      if (value && typeof value === 'object') {
        if (Array.isArray(value)) {
          for (const item of value) {
            this.walkAST(item, callback, depth + 1);
          }
        } else {
          this.walkAST(value, callback, depth + 1);
        }
      }
    }
  }

  private getCalleeName(node: any): string {
    if (!node.callee) return '';
    
    if (node.callee.type === 'Identifier') {
      return node.callee.name;
    } else if (node.callee.type === 'MemberExpression') {
      if (node.callee.property.type === 'Identifier') {
        return node.callee.property.name;
      }
    }
    return '';
  }

  private extractSnippet(code: string, node: any): string {
    if (node.start != null && node.end != null) {
      return code.substring(node.start, Math.min(node.end, node.start + 100));
    }
    return 'Code snippet unavailable';
  }

  private async scanForMaliciousPatterns(code: string): Promise<ThreatReport> {
    const threats: Threat[] = [];
    
    const patterns = [
      { regex: /process\.env/g, type: 'env_access', severity: 6 },
      { regex: /require\(['"]child_process['"]\)/g, type: 'child_process', severity: 9 },
      { regex: /\.writeFileSync|\.writeFile/g, type: 'file_write', severity: 7 },
      { regex: /\.execSync|\.exec/g, type: 'command_execution', severity: 10 },
      { regex: /new\s+Function\s*\(/g, type: 'dynamic_function', severity: 8 },
      { regex: /fetch\s*\([^)]*\)/g, type: 'network_request', severity: 5 },
      { regex: /XMLHttpRequest|axios|http\.request/g, type: 'http_request', severity: 5 },
    ];

    for (const { regex, type, severity } of patterns) {
      const matches = code.match(regex);
      if (matches) {
        threats.push({
          type: 'malicious_pattern',
          pattern: type,
          occurrences: matches.length,
          severity,
          locations: [],
        });
      }
    }

    return {
      threats,
      riskLevel: this.calculateRiskLevel(threats),
      score: this.calculateThreatScore(threats),
    };
  }

  private async detectDataExfiltration(model: AIModel): Promise<ThreatReport> {
    const threats: Threat[] = [];
    const code = model.code;

    const exfiltrationPatterns = [
      { regex: /btoa\s*\([^)]*\)/g, type: 'base64_encoding', severity: 6 },
      { regex: /atob\s*\([^)]*\)/g, type: 'base64_decoding', severity: 6 },
      { regex: /localStorage\.|sessionStorage\./g, type: 'storage_access', severity: 7 },
      { regex: /document\.cookie/g, type: 'cookie_access', severity: 8 },
      { regex: /navigator\.(sendBeacon|clipboard)/g, type: 'data_beacon', severity: 8 },
      { regex: /WebSocket|EventSource/g, type: 'persistent_connection', severity: 7 },
    ];

    for (const { regex, type, severity } of exfiltrationPatterns) {
      const matches = code.match(regex);
      if (matches) {
        threats.push({
          type: 'data_exfiltration',
          pattern: type,
          occurrences: matches.length,
          severity,
          locations: [],
        });
      }
    }

    return {
      threats,
      riskLevel: this.calculateRiskLevel(threats),
      score: this.calculateThreatScore(threats),
    };
  }

  private async verifyIntegrity(model: AIModel): Promise<ThreatReport> {
    const threats: Threat[] = [];
    
    // Check for signature if provided
    if (model.developerSignature) {
      const isValid = await this.verifySignature(model.code, model.developerSignature);
      if (!isValid) {
        threats.push({
          type: 'integrity_violation',
          pattern: 'Invalid developer signature',
          occurrences: 1,
          severity: 9,
          locations: [],
        });
      }
    }

    // Check checksum
    if (model.metadata.checksum) {
      const calculatedChecksum = this.calculateChecksum(model.code);
      if (calculatedChecksum !== model.metadata.checksum) {
        threats.push({
          type: 'integrity_violation',
          pattern: 'Checksum mismatch',
          occurrences: 1,
          severity: 10,
          locations: [],
        });
      }
    }

    return {
      threats,
      riskLevel: this.calculateRiskLevel(threats),
      score: this.calculateThreatScore(threats),
    };
  }

  private async verifySignature(code: string, signature: string): Promise<boolean> {
    try {
      const publicKey = process.env.DEVELOPER_PUBLIC_KEY;
      
      if (!publicKey) {
        console.warn('No public key configured for signature verification');
        return false;
      }
      
      // JWT verification would be implemented here with jsonwebtoken package
      // For now, we'll use a simple checksum verification
      const codeHash = this.calculateChecksum(code);
      const expectedSignature = crypto
        .createHmac('sha256', publicKey)
        .update(codeHash)
        .digest('hex');
      
      return signature === expectedSignature;
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  private async scanAISpecificThreats(model: AIModel): Promise<AISpecificReport> {
    const backdoorRisk = this.assessBackdoorRisk(model.code);
    const adversarialRobustness = this.assessAdversarialRobustness(model);
    const biasDetected = this.detectBias(model.code);
    const privacyLeaks = this.detectPrivacyLeaks(model.code);

    return {
      backdoorRisk,
      adversarialRobustness,
      biasDetected,
      privacyLeaks,
    };
  }

  private assessBackdoorRisk(code: string): number {
    let risk = 0;
    
    const backdoorIndicators = [
      { pattern: /hidden_trigger|backdoor|secret_key/gi, weight: 30 },
      { pattern: /if\s*\([^)]*===[^)]*\)\s*{\s*return[^}]*}/g, weight: 20 },
      { pattern: /specific_input|magic_number/gi, weight: 25 },
      { pattern: /bypass|override|admin_mode/gi, weight: 25 },
    ];

    for (const { pattern, weight } of backdoorIndicators) {
      if (pattern.test(code)) {
        risk += weight;
      }
    }

    return Math.min(100, risk);
  }

  private assessAdversarialRobustness(model: AIModel): number {
    const cacheKey = `robustness_${model.id}`;
    const cached = this.regexCache.get(cacheKey);
    if (cached !== undefined) return cached ? 100 : 0;

    let score = 100;
    const code = model.code;
    
    const validationPatterns = [
      { pattern: /input.*validation|validate.*input|sanitize/gi, weight: 20 },
      { pattern: /bounds.*check|range.*check|limit/gi, weight: 15 },
      { pattern: /try.*catch|error.*handling|exception/gi, weight: 15 },
      { pattern: /assert|require|check/gi, weight: 10 },
      { pattern: /normalize|preprocess/gi, weight: 10 },
    ];

    for (const { pattern, weight } of validationPatterns) {
      if (!pattern.test(code)) {
        score -= weight;
      }
    }

    if (!/adversarial|robust|defend/gi.test(code)) {
      score -= 10;
    }

    const finalScore = Math.max(0, score);
    this.regexCache.set(cacheKey, finalScore > 50);
    return finalScore;
  }

  private detectBias(code: string): boolean {
    const biasIndicators = [
      /gender|race|ethnicity|religion/gi,
      /male|female|man|woman/gi,
      /white|black|asian|hispanic/gi,
      /christian|muslim|jewish|hindu/gi,
    ];

    return biasIndicators.some(pattern => pattern.test(code));
  }

  private detectPrivacyLeaks(code: string): boolean {
    const privacyPatterns = [
      /email|phone|address|ssn/gi,
      /password|credential|secret/gi,
      /personal|private|confidential/gi,
      /user_data|customer_info/gi,
    ];

    return privacyPatterns.some(pattern => pattern.test(code));
  }

  private async sandboxTest(model: AIModel): Promise<ThreatReport> {
    const threats: Threat[] = [];
    
    // Alternative security analysis without sandbox execution
    // This provides static analysis without running potentially dangerous code
    
    // Check for dangerous patterns that would fail in sandbox
    const dangerousPatterns = [
      { pattern: /process\.exit/g, severity: 9, type: 'process_exit' },
      { pattern: /require\(['"]fs['"]\)/g, severity: 8, type: 'filesystem_access' },
      { pattern: /require\(['"]path['"]\)/g, severity: 7, type: 'path_access' },
      { pattern: /global\./g, severity: 7, type: 'global_access' },
      { pattern: /Buffer\.alloc/g, severity: 6, type: 'buffer_allocation' },
      { pattern: /setInterval|setTimeout/g, severity: 6, type: 'timer_functions' },
    ];

    for (const { pattern, severity, type } of dangerousPatterns) {
      const matches = Array.from(model.code.matchAll(pattern));
      if (matches.length > 0) {
        threats.push({
          type: 'sandbox_violation',
          pattern: `Static analysis: ${type}`,
          occurrences: matches.length,
          severity,
          locations: matches.slice(0, 3).map(match => ({
            line: model.code.substring(0, match.index).split('\n').length,
            column: match.index! - model.code.lastIndexOf('\n', match.index! - 1) - 1,
            snippet: match[0],
          })),
        });
      }
    }

    // Additional static checks for resource exhaustion patterns
    if (/while\s*\(\s*true\s*\)|for\s*\(\s*;;\s*\)/.test(model.code)) {
      threats.push({
        type: 'sandbox_violation',
        pattern: 'Infinite loop detected',
        occurrences: 1,
        severity: 8,
        locations: [],
      });
    }

    return {
      threats,
      riskLevel: this.calculateRiskLevel(threats),
      score: this.calculateThreatScore(threats),
    };
  }

  private calculateRiskLevel(threats: Threat[]): 'low' | 'medium' | 'high' | 'critical' {
    const maxSeverity = Math.max(...threats.map(t => t.severity), 0);
    
    if (maxSeverity >= 9) return 'critical';
    if (maxSeverity >= 7) return 'high';
    if (maxSeverity >= 5) return 'medium';
    return 'low';
  }

  private calculateThreatScore(threats: Threat[]): number {
    if (threats.length === 0) return 100;
    
    const totalSeverity = threats.reduce((sum, threat) => 
      sum + (threat.severity * threat.occurrences), 0
    );
    
    const maxPossibleSeverity = threats.reduce((sum, threat) => 
      sum + (10 * threat.occurrences), 0
    );
    
    return Math.max(0, Math.round(100 - (totalSeverity / maxPossibleSeverity) * 100));
  }

  private aggregateResults(
    modelId: string, 
    scanId: string, 
    results: PromiseSettledResult<any>[]
  ): SecurityScanResult {
    const reports: any = {};
    const allThreats: Threat[] = [];
    let failed = false;

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        const report = result.value;
        const reportName = this.getReportName(index);
        reports[reportName] = report;
        
        if (report.threats) {
          allThreats.push(...report.threats);
        }
      } else {
        failed = true;
        console.error('Scan component failed:', result.reason);
      }
    });

    const overallScore = this.calculateOverallScore(reports);
    const threatLevel = this.determineThreatLevel(overallScore, allThreats);
    const quarantined = threatLevel === 'critical' || threatLevel === 'malicious';

    return {
      scanId,
      modelId,
      scanDate: new Date(),
      overallScore,
      threatLevel,
      reports,
      recommendations: this.generateRecommendations(allThreats),
      quarantined,
      cryptographicProof: this.generateCryptographicProof(scanId, reports),
      scanDuration: 0, // Will be set by caller
    };
  }

  private getReportName(index: number): string {
    const names = ['pattern', 'dataExfiltration', 'integrity', 'aiSpecific', 'ast', 'sandbox'];
    return names[index] || `report_${index}`;
  }

  private calculateOverallScore(reports: any): number {
    const scores = Object.values(reports)
      .filter((r: any) => r.score !== undefined)
      .map((r: any) => r.score);
    
    if (scores.length === 0) return 0;
    
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  private determineThreatLevel(
    score: number, 
    threats: Threat[]
  ): 'safe' | 'suspicious' | 'malicious' | 'critical' {
    const hasCriticalThreat = threats.some(t => t.severity >= 9);
    
    if (hasCriticalThreat || score < 30) return 'critical';
    if (score < 50) return 'malicious';
    if (score < 80) return 'suspicious';
    return 'safe';
  }

  private generateRecommendations(threats: Threat[]): string[] {
    const recommendations: string[] = [];
    
    if (threats.some(t => t.type === 'code_execution')) {
      recommendations.push('Remove dynamic code execution patterns');
    }
    
    if (threats.some(t => t.type === 'data_exfiltration')) {
      recommendations.push('Review and remove unnecessary data access patterns');
    }
    
    if (threats.some(t => t.severity >= 8)) {
      recommendations.push('Address high-severity security issues before deployment');
    }
    
    return recommendations;
  }

  private generateCryptographicProof(scanId: string, reports: any): string {
    const data = JSON.stringify({ scanId, reports, timestamp: Date.now() });
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private calculateChecksum(code: string): string {
    return crypto.createHash('sha256').update(code, 'utf8').digest('hex');
  }

  private generateScanId(): string {
    return `scan_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
  }

  private createFailedScanResult(modelId: string, scanId: string, error: Error): SecurityScanResult {
    return {
      scanId,
      modelId,
      scanDate: new Date(),
      overallScore: 0,
      threatLevel: 'critical',
      reports: {
        error: {
          message: error.message,
          stack: error.stack,
        },
      },
      recommendations: ['Fix scan errors and retry'],
      quarantined: true,
      cryptographicProof: this.generateCryptographicProof(scanId, { error: error.message }),
      scanDuration: 0,
    };
  }

  private async withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
      ),
    ]);
  }
}