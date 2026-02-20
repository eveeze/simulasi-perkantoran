const fs = require('fs');
const files = fs.readdirSync('tests').filter(f => f.endsWith('.spec.js'));
let changed = false;
for (const file of files) {
  let content = fs.readFileSync('tests/' + file, 'utf8');
  if (content.includes("not.toBeEmpty()")) continue;
  
  let newContent = content.replace(
    /await page\.getByRole\('button', \{ name: \/masuk\/i[^}]*\}\)\.click\(\);/g,
    `await expect(page.locator('input[type="email"]')).not.toBeEmpty();\n    await page.getByRole('button', { name: /masuk/i, exact: true }).click();`
  );
  if (content !== newContent) {
    fs.writeFileSync('tests/' + file, newContent);
    console.log('Fixed', file);
    changed = true;
  }
}
if (!changed) console.log('No files changed');
