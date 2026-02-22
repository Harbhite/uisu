import os

file_path = 'src/pages/resources/AIQuizPage.tsx'

with open(file_path, 'r') as f:
    content = f.read()

# Add import
if 'import { parseFile }' not in content:
    content = content.replace(
        "import { supabase } from '@/integrations/supabase/client';",
        "import { supabase } from '@/integrations/supabase/client';\nimport { parseFile } from '@/utils/fileParser';"
    )

# Replace readFileAsText
old_function_start = "  const readFileAsText = async (file: File): Promise<string> => {"
old_function_end = "  };"

# Find start
start_idx = content.find(old_function_start)
if start_idx != -1:
    # Find the matching closing brace for this function block
    # This is tricky with simple find, but since we know the indentation...
    # Let's assume the function ends where we see "  };" with same indentation
    # after the start.

    # Actually, the provided code snippet has indentation.
    # We can search for the specific implementation body to replace.

    old_impl = """    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      if (file.type.startsWith('image/')) {
        // For images, we just send the name since edge function can't process raw image bytes
        resolve(`[Image file: ${file.name}]`);
      } else {
        reader.readAsText(file);
      }
    });"""

    new_impl = """    try {
      return await parseFile(file);
    } catch (error) {
      console.error('File parsing error:', error);
      toast.error('Failed to parse file. Please try a text file.');
      throw error;
    }"""

    if old_impl in content:
        content = content.replace(old_impl, new_impl)
    else:
        # Fallback regex or fuzzy match if spacing is off
        # Let's try to locate by start and just replace the block if possible
        # Or just use Python to find the block
        pass

# Write back
with open(file_path, 'w') as f:
    f.write(content)
