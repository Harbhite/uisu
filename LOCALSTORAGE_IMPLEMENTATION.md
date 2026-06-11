# Admin Dashboard localStorage Implementation

## Overview

This document describes the localStorage persistence implementation for the admin dashboard in the Harbhite/uisu project. The implementation allows admin users to have their dashboard preferences, form drafts, and filter states automatically saved and restored across browser sessions.

## What Gets Persisted

The following admin dashboard state is automatically persisted to localStorage:

### Navigation & UI State
- **activeTab**: Currently selected dashboard tab (events, announcements, documents, clubs, administrations, admins, audit, publications, submissions, newsletter, complaints, analytics, feedback)

### Newsletter Composer State
- **composeSubject**: Newsletter subject line
- **composeContent**: Newsletter body content (HTML)
- **selectedTemplate**: Selected email template (classic, minimal, announcement, newspaper, longform, telegram, artdeco, blueprint, postbox)
- **scheduleDate**: Scheduled send date
- **scheduleTime**: Scheduled send time
- **senderName**: Newsletter sender name
- **audienceMode**: Audience selection mode (all, saved, adhoc)
- **selectedAudienceId**: Selected saved audience ID
- **adhocEmailsText**: Ad-hoc recipient email addresses

### A/B Testing State
- **abEnabled**: Whether A/B testing is enabled
- **abVariantA**: First A/B test variant template
- **abVariantB**: Second A/B test variant template

### Audit Log Filters
- **auditSearchQuery**: Search query for audit logs
- **auditActionFilter**: Filter by action type
- **auditStartDate**: Filter start date
- **auditEndDate**: Filter end date
- **auditTableFilter**: Filter by table name

### Form/Modal State
- **formData**: Current form data for CRUD operations (events, announcements, documents, clubs, administrations)
- **teamMembers**: Team member entries for administration forms
- **activitiesInput**: Activities input for club forms

## Storage Key

All state is stored under a single localStorage key: `admin_dashboard_state`

The storage format is JSON:
```json
{
  "activeTab": "newsletter",
  "composeSubject": "Weekly Update",
  "composeContent": "<p>Hello...</p>",
  "selectedTemplate": "classic",
  "scheduleDate": "2024-06-15",
  "scheduleTime": "10:00",
  "abEnabled": false,
  "abVariantA": "classic",
  "abVariantB": "minimal",
  "senderName": "UISU Archive",
  "audienceMode": "all",
  "selectedAudienceId": "",
  "adhocEmailsText": "",
  "auditSearchQuery": "",
  "auditActionFilter": "all",
  "auditStartDate": "",
  "auditEndDate": "",
  "auditTableFilter": "all",
  "formData": {},
  "teamMembers": [],
  "activitiesInput": ""
}
```

## Implementation Details

### Hook: `useAdminDashboardPersistence`

Located in `src/hooks/useAdminDashboardPersistence.ts`, this custom hook provides:

#### Main Hook: `useAdminDashboardPersistence(state, enabled)`

Manages automatic persistence of admin dashboard state with debouncing.

**Parameters:**
- `state`: Partial `AdminDashboardState` object containing current values
- `enabled`: Boolean to enable/disable persistence (default: true)

**Returns:**
- `saveState()`: Function to manually trigger state save
- `restoreState()`: Function to restore state from localStorage
- `clearState()`: Function to clear all persisted state

**Features:**
- Automatic debounced saving (1000ms debounce)
- Change detection to avoid unnecessary saves
- Error handling and logging
- Type-safe state management

#### Helper Hook: `useAdminDashboardValue<T>(key, defaultValue, enabled)`

For persisting individual values without the full state object.

**Parameters:**
- `key`: Key from `AdminDashboardState`
- `defaultValue`: Default value if not found in storage
- `enabled`: Boolean to enable/disable persistence

**Returns:**
- `[value, setValue]`: Tuple with current value and setter function

### Integration in AdminDashboard.tsx

1. **State Restoration on Mount**:
   ```typescript
   const persistedState = (() => {
     try {
       const saved = localStorage.getItem('admin_dashboard_state');
       if (saved) {
         return JSON.parse(saved) as Partial<AdminDashboardState>;
       }
     } catch {}
     return {};
   })();
   ```

2. **State Initialization**:
   All relevant state variables are initialized with persisted values:
   ```typescript
   const [activeTab, setActiveTab] = useState<TabType>(() => {
     if (persistedState.activeTab && [...valid tabs...].includes(persistedState.activeTab as string)) {
       return persistedState.activeTab as TabType;
     }
     return "events";
   });
   ```

3. **Automatic Persistence**:
   ```typescript
   const currentState: Partial<AdminDashboardState> = {
     activeTab,
     composeSubject,
     composeContent,
     // ... other state fields
   };

   const { saveState } = useAdminDashboardPersistence(currentState, true);

   useEffect(() => {
     saveState();
   }, [currentState, saveState]);
   ```

4. **Draft Clearing**:
   When operations complete successfully, drafts are cleared:
   ```typescript
   const clearNewsletterDraft = useCallback(() => {
     setComposeSubject("");
     setComposeContent("");
     setScheduleDate("");
     setScheduleTime("");
   }, []);

   const clearFormDraft = useCallback(() => {
     setFormData({});
     setTeamMembers([]);
     setActivitiesInput("");
   }, []);
   ```

## User Experience Benefits

1. **Draft Recovery**: Users can navigate away and return to find their draft content intact
2. **Filter Persistence**: Search and filter settings are remembered across sessions
3. **Template Selection**: Last used email template is remembered
4. **Tab Navigation**: Users return to the last viewed dashboard tab
5. **Form Continuity**: Multi-step form data is preserved if the page is accidentally refreshed

## Data Privacy & Security

- **Local Storage Only**: Data is stored only in the user's browser, not sent to servers
- **No Sensitive Data**: Passwords, API keys, and authentication tokens are never persisted
- **User-Specific**: Each browser/user has their own isolated localStorage
- **Automatic Clearing**: Drafts are cleared after successful submission
- **Manual Clearing**: Users can clear browser data to remove persisted state

## Performance Considerations

- **Debounced Saves**: State is saved with a 1000ms debounce to avoid excessive writes
- **Change Detection**: Only saves when state actually changes
- **Minimal Storage**: Typical state object is < 10KB
- **No Network Impact**: All operations are synchronous and local

## Browser Compatibility

localStorage is supported in all modern browsers:
- Chrome 4+
- Firefox 3.5+
- Safari 4+
- Edge (all versions)
- Opera 10.5+

## Testing the Implementation

1. **Open Admin Dashboard**: Navigate to `/admin`
2. **Make Changes**: Edit newsletter draft, change filters, etc.
3. **Refresh Page**: Press F5 or Ctrl+R
4. **Verify Persistence**: Your changes should still be there
5. **Check Storage**: Open DevTools → Application → localStorage → search for `admin_dashboard_state`

## Troubleshooting

### State Not Persisting

1. Check if localStorage is enabled in browser
2. Verify browser isn't in private/incognito mode (some browsers disable localStorage)
3. Check browser console for errors
4. Verify storage quota hasn't been exceeded

### State Not Restoring

1. Clear browser cache and localStorage
2. Check that the stored JSON is valid
3. Verify component is using the latest hook implementation

### Performance Issues

1. Check if state object is too large (> 5MB)
2. Verify debounce timing is appropriate
3. Monitor browser DevTools for excessive saves

## Future Enhancements

Potential improvements for future versions:

1. **Selective Persistence**: Allow users to choose which state to persist
2. **Cloud Sync**: Sync state across devices using user account
3. **Version Control**: Track state changes over time
4. **Export/Import**: Allow users to export/import their dashboard configuration
5. **Compression**: Compress stored state for larger datasets
6. **Encryption**: Encrypt sensitive data before storing

## Related Files

- `src/hooks/useAdminDashboardPersistence.ts` - Main persistence hook
- `src/pages/AdminDashboard.tsx` - Admin dashboard component using the hook
- `src/stores/useAppStore.ts` - Global app store (alternative persistence method)
- `src/hooks/useFormDraft.ts` - Form-specific draft persistence hook

## Support & Maintenance

For issues or questions about the localStorage implementation:

1. Check this documentation first
2. Review the hook implementation in `useAdminDashboardPersistence.ts`
3. Check browser console for error messages
4. Verify localStorage is not disabled or full
5. Contact the development team if issues persist
