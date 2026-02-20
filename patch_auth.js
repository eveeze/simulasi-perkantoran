const fs = require('fs');
const path = require('path');

const authCheckFinance = `
    const auth = await authenticateRequest(request);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!['ADMIN', 'MANAGER', 'SECRETARY'].includes(auth.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
`;

const authCheckAdmin = `
    const auth = await authenticateRequest(request);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (auth.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
`;

const authCheckAny = `
    const auth = await authenticateRequest(request);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
`;

function patchFile(filePath, authSnippet) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (
    content.includes('const auth = await authenticateRequest(request);') &&
    content.indexOf('export async function GET') <
      content.indexOf('const auth = await authenticateRequest(request);')
  ) {
    return;
  }

  const regex = /export async function GET\(request\) \{\s*try \{/;
  if (regex.test(content)) {
    content = content.replace(
      regex,
      `export async function GET(request) {\n  try {${authSnippet}`,
    );
    fs.writeFileSync(filePath, content);
    console.log('Patched', filePath);
    return;
  }

  const regex2 = /export async function GET\(\) \{\s*try \{/;
  if (regex2.test(content)) {
    content = content.replace(
      regex2,
      `export async function GET(request) {\n  try {${authSnippet}`,
    );
    fs.writeFileSync(filePath, content);
    console.log('Patched (empty args)', filePath);
    return;
  }

  console.log('Could not find GET handler in', filePath);
}

// 1. Finance & Reports (ADMIN, MANAGER, SECRETARY)
const financeFiles = [
  'app/api/revenue/route.js',
  'app/api/revenue/[id]/route.js',
  'app/api/expenses/route.js',
  'app/api/expenses/[id]/route.js',
  'app/api/debts/route.js',
  'app/api/debts/[id]/route.js',
  'app/api/reports/route.js',
  'app/api/reports/[id]/route.js',
];
for (const file of financeFiles) {
  if (fs.existsSync(file)) patchFile(file, authCheckFinance);
}

// 2. Employees (ADMIN only)
const employeeFiles = [
  'app/api/employees/route.js',
  'app/api/employees/[id]/route.js',
];
for (const file of employeeFiles) {
  if (fs.existsSync(file)) patchFile(file, authCheckAdmin);
}

// 3. Documents (Any Auth)
const docFiles = [
  'app/api/documents/route.js',
  'app/api/documents/[id]/route.js',
];
for (const file of docFiles) {
  if (fs.existsSync(file)) patchFile(file, authCheckAny);
}
