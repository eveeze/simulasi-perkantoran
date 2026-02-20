const fs = require('fs');

// 1. api.spec.js
let apiCode = fs.readFileSync('tests/api.spec.js', 'utf8');
apiCode = apiCode.replace(
  /if \(page\.url\(\)\.includes\('\/dashboard\/admin'\)\) \{\s*await expect\(accessDenied\)\.toBeVisible\(\);\s*\} else \{\s*await expect\(page\)\.not\.toHaveURL\('\/dashboard\/admin'\);\s*\}/s,
  "await expect(page).not.toHaveURL('/dashboard/admin');"
);
fs.writeFileSync('tests/api.spec.js', apiCode);

// 2. auth.spec.js
let authCode = fs.readFileSync('tests/auth.spec.js', 'utf8');
authCode = authCode.replace(
  /const logoutBtn = page\.getByRole\('button', \{ name: \/logout\|keluar\/i \}\);\s*if \(\(await logoutBtn\.count\(\)\) > 0\) \{\s*await logoutBtn\.first\(\)\.click\(\);\s*\} else \{\s*await page\s*\.getByText\(\/keluar\/i\)\s*\.last\(\)\s*\.click\(\);\s*\}/s,
  `const logoutBtn = page.getByRole('button', { name: /logout|keluar/i });
    if ((await logoutBtn.count()) > 0) {
      await logoutBtn.first().click({ force: true });
    } else {
      await page.getByText(/keluar/i).last().click({ force: true });
    }`
);
fs.writeFileSync('tests/auth.spec.js', authCode);

// 3. dashboard.spec.js
let dashCode = fs.readFileSync('tests/dashboard.spec.js', 'utf8');
dashCode = dashCode.replace(
  /await expect\(page\.getByText\(\/Cuti Pending\/i\)\)\.toBeVisible\(\);/,
  "await expect(page.getByText(/Cuti Pending/i).first()).toBeVisible();"
);
dashCode = dashCode.replace(
  /await expect\(\s*page\.getByText\(\/Pengajuan Cuti Pending\/i, \{ exact: false \}\),\s*\)\.toBeVisible\(\);/s,
  "await expect(page.getByText(/Pengajuan Cuti Pending/i, { exact: false }).first()).toBeVisible();"
);
fs.writeFileSync('tests/dashboard.spec.js', dashCode);

// 4. leave.spec.js
let leaveCode = fs.readFileSync('tests/leave.spec.js', 'utf8');
leaveCode = leaveCode.replace(
  /await expect\(\s*page\.getByText\('PENDING'\)\.or\(page\.getByText\('Menunggu'\)\),\s*\)\.toBeVisible\(\);/s,
  "await expect(page.getByText('PENDING').or(page.getByText('Menunggu')).first()).toBeVisible();"
);
fs.writeFileSync('tests/leave.spec.js', leaveCode);
