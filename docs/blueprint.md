# **App Name**: Code Caster

## Core Features:

- HTML Injection: Allows the user to paste HTML code (starting with <!DOCTYPE html>) into a designated area.
- Code Sanitization: Before rendering, the app will automatically sanitize the input to remove potential cross-site scripting (XSS) vulnerabilities. Disables javascript execution. All links are rendered in an iframe.
- Live Preview: Renders the sanitized HTML in a live preview area so users can see the final output.
- Interface Selection: Automatically identify different code interface approaches such as: layout systems and web frameworks.

## Style Guidelines:

- Primary color: Deep indigo (#3F51B5) to create a professional and reliable feel.
- Background color: Very light grey (#F0F0F0) for a clean, distraction-free workspace.
- Accent color: A muted teal (#4CAF50) to complement the primary indigo.
- Body and headline font: 'Inter', a grotesque-style sans-serif.
- Code font: 'Source Code Pro' for displaying pasted HTML snippets.
- Minimalist icons for core UI elements like copy and paste actions.
- Subtle fade-in effects when new code is rendered in the preview.