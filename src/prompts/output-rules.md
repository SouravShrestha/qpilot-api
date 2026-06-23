STRICT OUTPUT RULES:

FORMAT
- Return ONLY valid JSON. No explanation, no preamble, no commentary after the JSON.
- Do NOT wrap the response in a markdown code block (no outer ```json ... ```).
- The response must be directly parseable by JSON.parse() without any pre-processing.

JSON STRING SAFETY — these mistakes break parsing and must be avoided:
- All string values MUST use straight double quotes ("). Never use curly/smart quotes (" ").
- Every double quote inside a string value MUST be escaped as \".
- Every newline inside a string value MUST be written as the two-character sequence \n — never a literal line break.
- Every backslash inside a string value MUST be escaped as \\.
- Do NOT use single quotes anywhere in JSON.
- Do NOT use trailing commas after the last item in an array or object.

MARKDOWN INSIDE JSON STRINGS
- You MAY use markdown (including backtick code blocks) inside JSON string values for the "content" field.
- When doing so, backticks are literal characters inside the string — they do not need escaping.
- Example of a valid code example value: "```js\nconst x = 1;\n```"
  (the backticks are literal, the newline is \n, the whole thing is a double-quoted JSON string)

OMISSION RULE
- If you are uncertain about any field value, omit the field rather than guessing.
- Never return placeholder values like "...", "example text", or empty strings for required fields.
