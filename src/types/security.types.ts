// types/security.types.ts
export interface AIModel {
  id: string;
  developer_id: string;
  name: string;
  description?: string;
  code: string;
  testCode: string;
  framework: 'tensorflow' | 'pytorch' | 'custom' | 'javascript' | 'python';
  metadata: ModelMetadata;
  developerSignature?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ModelMetadata {
  name: string;
  version: string;
  size: number;
  checksum: string;
  checksumAlgorithm: 'sha256';
  originalFileName?: string;
  mimeType?: string;
  uploadedAt?: string;
}

export interface Threat {
  type: 'code_execution' | 'data_exfiltration' | 'malicious_pattern' | 'suspicious_pattern' | 'integrity_violation' | 'sandbox_violation';
  pattern: string;
  occurrences: number;
  severity: number; // 1-10
  locations: Array<{
    line: number;
    column: number;
    snippet: string;
  }>;
}

export interface ThreatReport {
  threats: Threat[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  score: number; // 0-100
}

export interface AISpecificReport {
  backdoorRisk: number;
  adversarialRobustness: number;
  biasDetected: boolean;
  privacyLeaks: boolean;
}

export interface SecurityScanResult {
  scanId: string;
  modelId: string;
  scanDate: Date;
  overallScore: number;
  threatLevel: 'safe' | 'suspicious' | 'malicious' | 'critical';
  reports: {
    pattern?: ThreatReport;
    dataExfiltration?: ThreatReport;
    integrity?: ThreatReport;
    aiSpecific?: AISpecificReport;
    ast?: ThreatReport;
    sandbox?: ThreatReport;
    error?: any;
  };
  recommendations: string[];
  quarantined: boolean;
  cryptographicProof: string;
  scanDuration: number;
  framework?: string;
  fromCache?: boolean;
}

export interface TrustScore {
  developer_id: string;
  overall_score: number;
  components: {
    developerReputation: number;
    modelPerformance: number;
    userFeedback: number;
    securityAudits: number;
    transactionHistory: number;
  };
  blockchain_proof?: string;
  last_updated: Date;
}