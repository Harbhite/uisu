import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const PORT = 8080;
const BASE_URL = `http://localhost:${PORT}`;

const paths = [
    '/',
    '/governance',
    '/past-leaders',
    '/current-leaders',
    '/documents',
    '/campus-map',
    '/communities',
    '/events',
    '/auth',
    '/admin',
    '/announcements',
    '/inks-vault',
    '/halls',
    '/resources',
    '/resources/academic-bank',
    '/resources/career-hub',
    '/resources/scholarships',
    '/resources/mental-wellness',
    '/resources/study-tools',
    '/resources/skill-up',
    '/resources/student-mart',
    '/resources/freshers-guide',
    '/resources/career-pathfinder',
    '/resources/campus-health',
    '/resources/gpa-calculator',
    '/resources/calculator-suite',
    '/style-guide',
    '/search',
    '/history',
    '/constitution',
    '/profile-card',
    '/privacy-policy',
    '/terms-of-service',
    '/unsubscribe',
    '/newsletter',
    '/tutorials',
    '/tutorials/catalog',
    '/tutorials/upload',
    // Dynamic with inferred IDs
    '/committee/finance-budget-committee',
    '/committee/disciplinary-committee',
    '/committee/audit-committee',
    '/committee/student-welfare-board',
    '/committee/sports-council',
    '/committee/press-publicity-committee',
    '/committee/academic-committee',
    '/committee/projects-capital-committee',
    '/committee/health-committee',
    // Halls
    '/governance/hall/mellamby-hall',
    '/governance/hall/tedder-hall',
    '/governance/hall/kuti-hall',
    '/governance/hall/sultan-bello-hall',
    '/governance/hall/queen-elizabeth-ii-hall',
    '/governance/hall/queen-idia-hall',
    '/governance/hall/independence-hall',
    '/governance/hall/nnamdi-azikiwe-hall',
    '/governance/hall/obafemi-awolowo-hall',
    // Tutorials
    '/tutorials/tut-1',
    '/tutorials/tutor/t-official',
    // Inks
    '/inks-vault/piece/art-001',
    // Leaders (Dummy ID)
    '/current-leaders/dummy-id'
];

// Helper to sanitize path for filename
const toFilename = (p) => {
    if (p === '/') return 'home.png';
    // Remove query params if any
    const cleanPath = p.split('?')[0];
    // Replace slashes with underscores, remove leading underscore if present
    let name = cleanPath.replace(/\//g, '_');
    if (name.startsWith('_')) name = name.substring(1);
    return name + '.png';
};

const main = async () => {
    console.log('Starting Vite server...');
    const server = spawn('npm', ['run', 'dev', '--', '--port', String(PORT)], {
        stdio: 'pipe',
        shell: true
    });

    let serverReady = false;

    const checkReady = (data) => {
        const output = data.toString();
        // console.log('[Server Output]', output);
        if (output.includes('Local:') || output.includes('ready in')) {
            serverReady = true;
        }
    };

    server.stdout.on('data', checkReady);
    server.stderr.on('data', checkReady); // Vite sometimes prints to stderr

    console.log('Waiting for server...');
    let retries = 0;
    while (!serverReady && retries < 60) {
        await new Promise(r => setTimeout(r, 1000));
        retries++;
    }

    if (!serverReady) {
        console.warn('Server readiness signal not detected. Attempting to connect anyway...');
    } else {
        console.log('Server is ready.');
    }

    // Give it a moment to fully initialize
    await new Promise(r => setTimeout(r, 2000));

    console.log('Launching browser...');
    const browser = await chromium.launch();
    const page = await browser.newPage({
        viewport: { width: 1200, height: 630 }
    });

    const outDir = 'public/og/pages-screenshot';
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    for (const p of paths) {
        const url = `${BASE_URL}${p}`;
        const filename = toFilename(p);
        const filepath = path.join(outDir, filename);

        console.log(`Taking screenshot of ${p} -> ${filepath}`);

        try {
            await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
            // Wait for animations
            await page.waitForTimeout(1000);

            await page.screenshot({ path: filepath });
            console.log(`Saved ${filepath}`);
        } catch (e) {
            console.error(`Failed to screenshot ${p}:`, e.message);
        }
    }

    await browser.close();

    console.log('Killing server...');
    // On Windows, tree kill might be needed, but simple kill works on Linux usually.
    // However, since we used shell: true, we might need to kill the process group or rely on OS cleanup.
    // But usually in this env, tree kill is not available.
    // We can try sending SIGTERM to the spawned process.
    server.kill();

    process.exit(0);
};

main().catch(e => {
    console.error(e);
    process.exit(1);
});
