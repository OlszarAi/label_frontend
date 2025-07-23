/**
 * Label Management - Dedykowany system do zarządzania etykietami
 * Centralizuje wszystkie operacje tworzenia, duplikowania i zarządzania etykietami
 */

// Components
export { CreateLabelButton } from './components';

// Services
export { LabelManagementService } from './services';

// Hooks
export { useLabelManagement } from './hooks';

// Types
export type { CreateLabelRequest, Label, ApiResponse } from './services/labelManagementService';
