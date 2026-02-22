import os

file_path = 'src/pages/resources/StudyBuddyPage.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# Add import
if 'import { supabase }' not in content:
    content = content.replace(
        "import { toast } from 'sonner';",
        "import { toast } from 'sonner';\nimport { supabase } from '@/integrations/supabase/client';"
    )

# Fix trailing slash in STUDY_BUDDY_URL
old_url_def = "const STUDY_BUDDY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/study-buddy`;"
new_url_def = "const STUDY_BUDDY_URL = `${import.meta.env.VITE_SUPABASE_URL?.replace(/\\/$/, '')}/functions/v1/study-buddy`;"

if old_url_def in content:
    content = content.replace(old_url_def, new_url_def)

# Update Authorization header in fetch calls
# We need to await the session token inside the header definition.
# This assumes the function containing the fetch is async (which it is).

old_auth_line = "Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,"
new_auth_line = "Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,"

if old_auth_line in content:
    content = content.replace(old_auth_line, new_auth_line)

# Write back
with open(file_path, 'w') as f:
    f.write(content)
