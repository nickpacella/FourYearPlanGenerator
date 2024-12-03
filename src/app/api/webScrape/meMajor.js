const puppeteer = require('puppeteer');

async function scrapeCourses() {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto('https://www.vanderbilt.edu/catalogs/kuali/undergraduate-24-25.php#/content/66577a6007c565001c90c731', {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    // Wait for the curriculum title to confirm dynamic content load
    await page.waitForFunction(
      () => document.body.innerText.includes("Specimen Curriculum for Mechanical Engineering"),
      { timeout: 60000 }
    );

    // Capture all tables and log their inner HTML for inspection
    const courseData = await page.evaluate(() => {
      const tables = document.querySelectorAll('table');
      const tableData = [];
      tables.forEach((table) => {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach((row) => {
          const cells = row.querySelectorAll('td');
          if (cells.length > 3) {
            const courseName = cells[0]?.innerText.trim() || ''; // Grabs class code like "CS 2270"
            const description = cells[1]?.innerText.trim() || ''; // Grabs description like "Programming and Problem Solving"
            const fallHours = cells[2]?.innerText.trim() || '';
            const springHours = cells[3]?.innerText.trim() || '';

            // Only add entries where `courseName` doesn't contain "YEAR" and isn't empty
            if (!courseName.includes("YEAR") && courseName) {
              tableData.push({ courseName, description, fallHours, springHours });
            }
          }
        });
      });
      return tableData;
    });

    console.log(JSON.stringify(courseData, null, 2));

    await browser.close();
  } catch (error) {
    console.error('Error scraping data:', error);
  }
}

scrapeCourses();
