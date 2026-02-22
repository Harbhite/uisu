import os

file_path = 'supabase/functions/ai-quiz/index.ts'

with open(file_path, 'r') as f:
    content = f.read()

old_logic = """    } else {
      // Fallback: try parsing content directly
      const content = data.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Could not extract quiz questions from AI response");
      }
    }"""

new_logic = """    } else {
      // Fallback: try parsing content directly
      const content = data.choices?.[0]?.message?.content || "";

      // Try to find JSON in markdown code blocks first
      const codeBlockMatch = content.match(/```(?:json)?\\s*(\[\\s*[\\s\\S]*?\\s*\])\\s*```/);

      if (codeBlockMatch) {
        try {
          questions = JSON.parse(codeBlockMatch[1]);
        } catch (e) {
          console.warn("Failed to parse code block JSON, trying fallback regex", e);
        }
      }

      if (!questions) {
        // Fallback to finding the largest array
        const jsonMatch = content.match(/\[[\\s\\S]*\]/);
        if (jsonMatch) {
          questions = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not extract quiz questions from AI response");
        }
      }
    }"""

if old_logic in content:
    content = content.replace(old_logic, new_logic)
else:
    print("Could not find exact match for old logic block.")

with open(file_path, 'w') as f:
    f.write(content)
