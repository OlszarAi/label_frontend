// Bulk Label Creation Feature - Entry Point

// Main Components
export { BulkLabelCreationModal } from './components/BulkLabelCreationModal';
export { BulkLabelEditor } from './components/BulkLabelEditor';
export { QuantitySelectionModal } from './components/QuantitySelectionModal';
export { TemplateSelectionModal } from './components/TemplateSelectionModal';

// Hooks
export { useBulkLabelCreation } from './hooks/useBulkLabelCreation';

// Services
export { BulkLabelService } from './services/BulkLabelService';
export { BulkLabelPostProcessor } from './services/BulkLabelPostProcessor';
export { TemplateService } from './services/TemplateService';

// Types
export type { 
  BulkLabelDesign, 
  BulkCreationOptions,
  BulkCreationStep,
  TemplateData
} from './types/bulk-label.types';

export type { 
  Template,
  TemplateCategory,
  CreateTemplateRequest,
  UpdateTemplateRequest,
  GetTemplatesParams
} from './services/TemplateService';
