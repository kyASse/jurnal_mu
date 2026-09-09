import { expect, test } from 'vitest';
import fs from 'fs';
import path from 'path';

test('theme colors are updated to Muhammadiyah brand guideline', () => {
    const cssPath = path.resolve(__dirname, '../../../css/app.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    // Light Mode
    expect(cssContent).toContain('--primary: #2C368A');
    expect(cssContent).toContain('--secondary: #E8242A');
    expect(cssContent).toContain('--accent-gradient: linear-gradient(135deg, #FCEE1F 0%, #E8242A 100%)');
    expect(cssContent).toContain('--sidebar-primary: #2C368A');
    expect(cssContent).toContain('--sidebar-accent: #f0f2ff');

    // Dark Mode
    expect(cssContent).toContain('--primary: #5C6BC0');
    expect(cssContent).toContain('--secondary: #EF5350');
    expect(cssContent).toContain('--sidebar-primary: #5C6BC0');
});
