const assert = require('node:assert');
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { startServer } = require('./app');

async function runTest() {
  const host = '127.0.0.1';

  // ✅ dynamic port (VERY IMPORTANT for Jenkins)
  const server = await startServer(0, host);
  const port = server.address().port;

  console.log(`🚀 Server started on ${port}`);

  let driver;

  try {
    const options = new chrome.Options();

    // ✅ Required for Jenkins (headless environment)
    options.addArguments('--headless=new');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();

    console.log("🌐 Opening browser...");

    await driver.get(`http://${host}:${port}`);

    const element = await driver.wait(
      until.elementLocated(By.id('result')),
      5000
    );

    const text = await element.getText();
    console.log("📄 Found:", text);

    // ✅ correct expected value
    assert.strictEqual(text, 'Sum is: 7');

    console.log('✅ Selenium test passed');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    if (driver) await driver.quit();
    server.close();
  }
}

runTest();
