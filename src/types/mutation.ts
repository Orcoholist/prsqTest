export interface BaseMutation {
  mutationId: string;
  evidenceLevel?: string;
  acmgSignificances?: string[];
  mutationType?: string;

  acmgAnnotations?: any[];
  analyses?: any[];
  analysesTranscripts?: any[];
  diagnosticAnnotations?: any[];
  drugs?: any[];
  hasPrivateAnnotations?: boolean;
  inAnalysis?: boolean;
  isAnnotatedByAcmg?: boolean;
  isAnnotatedByAmp?: boolean;
  lowTierAnnotations?: any[];
  maybeChrNumber?: string;
  maybeHgvsGdna?: string;
  maybeHighestTier?: string | null;
  maybeReferenceGenomeContigId?: string;
  maybeTrivialName?: string | null;
  organizationFrequencyRatio?: number;
  prognosticAnnotations?: any[];
  sentToAnnotation?: boolean;
  therapeuticAnnotations?: any[];
}

export type Mutation = BaseMutation;
