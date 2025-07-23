# Label Management System - Quick Reference

## 🚀 Quick Start

### Frontend - Create Label Button
```tsx
import { CreateLabelButton } from '@/features/label-management';

<CreateLabelButton projectId="your-project-id">
  Create Label
</CreateLabelButton>
```

### Frontend - Use Hook
```tsx
import { useLabelManagement } from '@/features/label-management';

const { createLabel, isCreating } = useLabelManagement({
  projectId: 'your-project-id'
});

await createLabel({ width: 100, height: 50 });
```

### Backend - API Call
```bash
curl -X POST http://localhost:3001/api/label-management/projects/PROJECT_ID/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"width": 100, "height": 50}'
```

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/label-management/projects/:projectId/create` | Create new label |
| POST | `/api/label-management/labels/:labelId/duplicate` | Duplicate existing label |
| POST | `/api/label-management/projects/:projectId/create-from-template` | Create from template |
| POST | `/api/label-management/projects/:projectId/bulk-create` | Create multiple labels |

## 🎨 Component Props

### CreateLabelButton
```tsx
interface CreateLabelButtonProps {
  projectId: string;                    // Required
  variant?: 'primary' | 'secondary' | 'minimal' | 'fab';
  size?: 'sm' | 'md' | 'lg';
  navigateToEditor?: boolean;
  onLabelCreated?: (label: Label) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}
```

## 🔧 Hook Options

### useLabelManagement
```tsx
interface UseLabelManagementOptions {
  projectId?: string;
  onLabelCreated?: (label: Label) => void;
  onLabelDuplicated?: (label: Label) => void;
  onError?: (error: string) => void;
}
```

## 📦 Import Paths

```tsx
// All-in-one import
import { 
  CreateLabelButton,
  useLabelManagement,
  LabelManagementService 
} from '@/features/label-management';

// Individual imports
import { CreateLabelButton } from '@/features/label-management/components';
import { useLabelManagement } from '@/features/label-management/hooks';
import { LabelManagementService } from '@/features/label-management/services';
```

## 🌟 Common Patterns

### Simple Create Button
```tsx
<CreateLabelButton projectId={projectId}>
  New Label
</CreateLabelButton>
```

### Create & Navigate to Editor
```tsx
<CreateLabelButton 
  projectId={projectId}
  navigateToEditor={true}
>
  Create & Edit
</CreateLabelButton>
```

### Custom Styling
```tsx
<CreateLabelButton 
  projectId={projectId}
  variant="fab"
  className="fixed bottom-4 right-4"
/>
```

### With Callback
```tsx
<CreateLabelButton 
  projectId={projectId}
  onLabelCreated={(label) => {
    toast.success(`Created ${label.name}`);
    refreshLabelsList();
  }}
>
  Create Label
</CreateLabelButton>
```

### Programmatic Creation
```tsx
const { createLabel, duplicateLabel } = useLabelManagement({
  projectId,
  onLabelCreated: (label) => console.log('Created:', label)
});

// Create label
await createLabel({ width: 100, height: 50 });

// Duplicate label
await duplicateLabel('existing-label-id');
```

## 🔍 Troubleshooting

### Common Issues

**Error: "Access token required"**
```bash
# Ensure Authorization header is included
curl -H "Authorization: Bearer YOUR_TOKEN" ...
```

**Error: "Project not found"**
```tsx
// Verify project ID exists and user has access
<CreateLabelButton projectId="valid-project-id" />
```

**TypeScript errors with Label type**
```tsx
// Use the correct Label type
import type { Label } from '@/features/label-management';
```

**Component not rendering**
```tsx
// Check if all required props are provided
<CreateLabelButton projectId={projectId} /> // ✅ projectId is required
```

### Debug Mode

```tsx
// Enable debug logging
const { createLabel } = useLabelManagement({
  projectId,
  debug: true // Will log all operations to console
});
```

## 📁 File Locations

### Backend
- Service: `src/services/label-management/labelCreationService.ts`
- Controller: `src/controllers/labelManagement.controller.ts`
- Routes: `src/routes/labelManagement.routes.ts`
- Docs: `src/services/label-management/README.md`

### Frontend
- Component: `src/features/label-management/components/CreateLabelButton.tsx`
- Hook: `src/features/label-management/hooks/useLabelManagement.ts`
- Service: `src/features/label-management/services/labelManagementService.ts`
- Docs: `src/features/label-management/README.md`

## ⚡ Performance Tips

### Frontend
- Use `useLabelManagement` hook to avoid re-creating functions
- Memoize `onLabelCreated` callbacks when possible
- Use appropriate button variants to avoid unnecessary renders

### Backend
- Bulk create for multiple labels instead of individual calls
- Use pagination for large label lists
- Cache project validation when creating multiple labels

## 🔒 Security Checklist

- ✅ Always include Authorization header
- ✅ Validate project ownership on backend
- ✅ Sanitize all user inputs
- ✅ Use HTTPS in production
- ✅ Validate JWT tokens properly

---

*Quick Reference - Version 2.0.0*
*Last Updated: July 23, 2025*
