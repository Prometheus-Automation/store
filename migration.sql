-- migration.sql - Complete production schema with all fixes
-- Run: npm run db:migrate

-- Ensure auth schema exists
CREATE SCHEMA IF NOT EXISTS auth;

-- Create update timestamp function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- User roles with timestamps
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'developer', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_user_roles_timestamp
BEFORE UPDATE ON user_roles
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- AI models with comprehensive validation
CREATE TABLE IF NOT EXISTS ai_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  description TEXT CHECK (char_length(description) <= 1000),
  code TEXT NOT NULL,
  framework TEXT CHECK (framework IN ('tensorflow', 'pytorch', 'custom', 'javascript', 'python')),
  security_scan_id TEXT,
  security_score INTEGER CHECK (security_score >= 0 AND security_score <= 100),
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TRIGGER update_ai_models_timestamp
BEFORE UPDATE ON ai_models
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Security scans with enhanced validation
CREATE TABLE IF NOT EXISTS security_scans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID REFERENCES ai_models(id) ON DELETE CASCADE,
  scan_id TEXT UNIQUE NOT NULL,
  threat_level TEXT CHECK (threat_level IN ('safe', 'suspicious', 'malicious', 'critical')),
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  pattern_report JSONB DEFAULT '{}' CHECK (jsonb_typeof(pattern_report) = 'object'),
  sandbox_report JSONB DEFAULT '{}' CHECK (jsonb_typeof(sandbox_report) = 'object'),
  exfiltration_report JSONB DEFAULT '{}' CHECK (jsonb_typeof(exfiltration_report) = 'object'),
  integrity_report JSONB DEFAULT '{}' CHECK (jsonb_typeof(integrity_report) = 'object'),
  ai_specific_report JSONB DEFAULT '{}' CHECK (jsonb_typeof(ai_specific_report) = 'object'),
  recommendations TEXT[] DEFAULT '{}',
  quarantined BOOLEAN DEFAULT false,
  cryptographic_proof TEXT NOT NULL,
  scan_duration_ms INTEGER CHECK (scan_duration_ms > 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- All indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_security_scans_model_id ON security_scans(model_id);
CREATE INDEX IF NOT EXISTS idx_security_scans_scan_id ON security_scans(scan_id);
CREATE INDEX IF NOT EXISTS idx_security_scans_threat_level ON security_scans(threat_level);
CREATE INDEX IF NOT EXISTS idx_security_scans_created_at ON security_scans(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_scans_quarantined ON security_scans(quarantined) WHERE quarantined = true;
CREATE INDEX IF NOT EXISTS idx_ai_models_developer_id ON ai_models(developer_id);
CREATE INDEX IF NOT EXISTS idx_ai_models_security_scan_id ON ai_models(security_scan_id);
CREATE INDEX IF NOT EXISTS idx_ai_models_framework ON ai_models(framework);

-- Trust scores with complete validation
CREATE TABLE IF NOT EXISTS trust_scores (
  developer_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_score NUMERIC(5,2) DEFAULT 50.00 CHECK (overall_score >= 0 AND overall_score <= 100),
  components JSONB DEFAULT '{}' CHECK (
    jsonb_typeof(components) = 'object' AND
    components ? 'developerReputation' AND
    components ? 'modelPerformance' AND
    components ? 'userFeedback' AND
    components ? 'securityAudits' AND
    components ? 'transactionHistory' AND
    (components->>'developerReputation')::numeric BETWEEN 0 AND 100 AND
    (components->>'modelPerformance')::numeric BETWEEN 0 AND 100 AND
    (components->>'userFeedback')::numeric BETWEEN 0 AND 100 AND
    (components->>'securityAudits')::numeric BETWEEN 0 AND 100 AND
    (components->>'transactionHistory')::numeric BETWEEN 0 AND 100
  ),
  blockchain_proof TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_trust_scores_timestamp
BEFORE UPDATE ON trust_scores
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE INDEX IF NOT EXISTS idx_trust_scores_overall_score ON trust_scores(overall_score DESC);
CREATE INDEX IF NOT EXISTS idx_trust_scores_last_updated ON trust_scores(last_updated DESC);

-- Model quarantine table
CREATE TABLE IF NOT EXISTS quarantined_models (
  model_id UUID PRIMARY KEY REFERENCES ai_models(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  scan_id TEXT REFERENCES security_scans(scan_id),
  quarantined_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed BOOLEAN DEFAULT false,
  reviewer_notes TEXT,
  review_deadline TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX IF NOT EXISTS idx_quarantined_models_reviewed ON quarantined_models(reviewed);
CREATE INDEX IF NOT EXISTS idx_quarantined_models_deadline ON quarantined_models(review_deadline);

-- Security audit logs with proper indexes
CREATE TABLE IF NOT EXISTS security_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL CHECK (event_type IN ('scan_completed', 'model_quarantined', 'trust_updated', 'manual_review', 'scan_failed', 'scan_error')),
  model_id UUID REFERENCES ai_models(id) ON DELETE SET NULL,
  developer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  details JSONB DEFAULT '{}',
  blockchain_tx TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON security_audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON security_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_developer_id ON security_audit_logs(developer_id);

-- Enhanced public view hiding all sensitive data
CREATE OR REPLACE VIEW public_security_scans AS
SELECT 
  s.id,
  s.scan_id,
  s.threat_level,
  s.overall_score,
  s.quarantined,
  s.created_at,
  m.name as model_name,
  m.framework,
  CASE 
    WHEN ur.role = 'admin' THEN m.developer_id
    ELSE NULL 
  END as developer_id
FROM security_scans s
JOIN ai_models m ON s.model_id = m.id
LEFT JOIN user_roles ur ON ur.user_id = auth.uid();

-- Enable RLS on all tables
ALTER TABLE ai_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarantined_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Comprehensive RLS Policies

-- User roles policies
CREATE POLICY "Users can view their own role" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles" ON user_roles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- AI Models policies
CREATE POLICY "Developers view own models" ON ai_models
  FOR SELECT USING (developer_id = auth.uid());

CREATE POLICY "Developers insert own models" ON ai_models
  FOR INSERT WITH CHECK (developer_id = auth.uid());

CREATE POLICY "Developers update own unverified models" ON ai_models
  FOR UPDATE USING (developer_id = auth.uid() AND verified = false);

CREATE POLICY "Admins manage all models" ON ai_models
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Security scans policies
CREATE POLICY "Developers view own scans" ON security_scans
  FOR SELECT USING (
    model_id IN (SELECT id FROM ai_models WHERE developer_id = auth.uid())
  );

CREATE POLICY "Admins view all scans" ON security_scans
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins update scans" ON security_scans
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "System insert scans" ON security_scans
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Admins delete scans" ON security_scans
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Trust scores policies
CREATE POLICY "Developers view own trust" ON trust_scores
  FOR SELECT USING (developer_id = auth.uid());

CREATE POLICY "Public view high trust" ON trust_scores
  FOR SELECT USING (overall_score >= 80);

CREATE POLICY "System update trust" ON trust_scores
  FOR ALL WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Quarantined models policies
CREATE POLICY "Developers view own quarantined" ON quarantined_models
  FOR SELECT USING (
    model_id IN (SELECT id FROM ai_models WHERE developer_id = auth.uid())
  );

CREATE POLICY "Admins manage quarantined" ON quarantined_models
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- Audit logs policies
CREATE POLICY "Developers view own logs" ON security_audit_logs
  FOR SELECT USING (developer_id = auth.uid());

CREATE POLICY "Admins view all logs" ON security_audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "System insert logs" ON security_audit_logs
  FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Function for complex trust score calculation
CREATE OR REPLACE FUNCTION calculate_trust_score(dev_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  avg_security_score NUMERIC;
  total_models INTEGER;
  quarantined_count INTEGER;
  new_score NUMERIC;
BEGIN
  SELECT 
    AVG(ss.overall_score),
    COUNT(DISTINCT am.id),
    COUNT(DISTINCT qm.model_id)
  INTO avg_security_score, total_models, quarantined_count
  FROM ai_models am
  LEFT JOIN security_scans ss ON am.id = ss.model_id
  LEFT JOIN quarantined_models qm ON am.id = qm.model_id
  WHERE am.developer_id = dev_id;
  
  -- Complex calculation with weights
  new_score := GREATEST(0, LEAST(100, 
    (COALESCE(avg_security_score, 50) * 0.4) +
    (LEAST(total_models * 2, 30) * 0.3) +
    (GREATEST(0, 50 - quarantined_count * 10) * 0.3)
  ));
  
  RETURN ROUND(new_score, 2);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Transaction function for atomic saves
CREATE OR REPLACE FUNCTION save_security_scan_transaction(
  p_model JSONB,
  p_scan_result JSONB
) RETURNS void AS $$
BEGIN
  -- Insert model
  INSERT INTO ai_models (
    id, developer_id, name, description, code, framework,
    security_scan_id, security_score, verified, metadata
  ) VALUES (
    (p_model->>'id')::uuid,
    (p_model->>'developer_id')::uuid,
    p_model->>'name',
    p_model->>'description',
    p_model->>'code',
    p_model->>'framework',
    p_scan_result->>'scanId',
    (p_scan_result->>'overallScore')::integer,
    NOT (p_scan_result->>'quarantined')::boolean,
    p_model->'metadata'
  );
  
  -- Insert scan
  INSERT INTO security_scans (
    model_id, scan_id, threat_level, overall_score,
    pattern_report, sandbox_report, exfiltration_report,
    integrity_report, ai_specific_report, recommendations,
    quarantined, cryptographic_proof, scan_duration_ms
  ) VALUES (
    (p_model->>'id')::uuid,
    p_scan_result->>'scanId',
    p_scan_result->>'threatLevel',
    (p_scan_result->>'overallScore')::integer,
    COALESCE(p_scan_result->'reports'->'pattern', '{}'),
    COALESCE(p_scan_result->'reports'->'sandbox', '{}'),
    COALESCE(p_scan_result->'reports'->'dataExfiltration', '{}'),
    COALESCE(p_scan_result->'reports'->'integrity', '{}'),
    COALESCE(p_scan_result->'reports'->'aiSpecific', '{}'),
    ARRAY(SELECT jsonb_array_elements_text(p_scan_result->'recommendations')),
    (p_scan_result->>'quarantined')::boolean,
    p_scan_result->>'cryptographicProof',
    (p_scan_result->>'scanDuration')::integer
  );
  
  -- Add to quarantine if needed
  IF (p_scan_result->>'quarantined')::boolean THEN
    INSERT INTO quarantined_models (
      model_id, reason, scan_id
    ) VALUES (
      (p_model->>'id')::uuid,
      'Failed security scan: ' || (p_scan_result->>'threatLevel'),
      p_scan_result->>'scanId'
    );
  END IF;
  
  -- Update trust score
  PERFORM calculate_trust_score((p_model->>'developer_id')::uuid);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public_security_scans TO authenticated;