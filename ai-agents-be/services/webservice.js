import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

export const searchAndScrape = async (parameters) => {
	const {
		location,
		min_price,
		max_price,
		bedrooms,
		bathrooms,
		property_type,
		min_sqft,
		max_sqft,
	} = parameters;
	const tempDir = path.join(process.cwd(), 'puppeteer_temp');
	if (!fs.existsSync(tempDir)) {
		fs.mkdirSync(tempDir);
	}
	try {
		const browser = await puppeteer.launch({
			headless: true,
			ignoreHTTPSErrors: true,
			args: [
				'--no-sandbox',
				'--disable-setuid-sandbox',
				'--disable-quic',
				'--disable-gpu',
				'--disable-blink-features=AutomationControlled',
				'--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
			],
			userDataDir: tempDir,
		});
		const page = await browser.newPage();
		await page.evaluateOnNewDocument(() => {
			Object.defineProperty(navigator, 'webdriver', {
				get: () => undefined,
			});
		});
		await page.goto('https://www.redfin.com/', {
			waitUntil: 'domcontentloaded',
			timeout: 60000,
		});

		try {
			const cookieSelector =
				'button[class*="accept"], button[id*="cookie"], button[aria-label*="cookie"], button[aria-label*="accept"]';
			await page.waitForSelector(cookieSelector, { timeout: 5000 });
			await page.click(cookieSelector);
			await new Promise((resolve) => setTimeout(resolve, 1000));
		} catch (e) {
			console.log('Web agent: No cookies to accept');
		}
		const inputSelector =
			'input#search-box-input.search-input-box[data-rf-test-name="search-box-input"]';
		await page.waitForSelector(inputSelector, { timeout: 30000 });
		await page.type(inputSelector, location);
		await new Promise((resolve) => setTimeout(resolve, 2000));
		const buttonSelector =
			'button[data-rf-test-name="searchButton"][aria-label="submit search"]';
		await page.waitForSelector(buttonSelector, { timeout: 30000 });
		const oldUrl = await page.url();
		await page.click(buttonSelector);
		await page.waitForFunction(
			(old) => window.location.href !== old,
			{ timeout: 60000 },
			oldUrl
		);
		await new Promise((resolve) => setTimeout(resolve, 10000));
		await page.waitForSelector('div[data-rf-test-id="filterButton"] button', {
			timeout: 30000,
		});
		await page.click('div[data-rf-test-id="filterButton"] button');
		await new Promise((resolve) => setTimeout(resolve, 5000));

		if (min_price) {
			const minInputSelector =
				'input.InputWrapper__input[placeholder="Enter min"]';
			await page.waitForSelector(minInputSelector, { timeout: 30000 });
			await page.type(minInputSelector, min_price);
		}

		if (max_price) {
			const maxInputSelector =
				'input.InputWrapper__input[placeholder="Enter max"]';
			await page.waitForSelector(maxInputSelector, { timeout: 30000 });
			await page.type(maxInputSelector, max_price);
		}

		if (bedrooms) {
			let mappedBedrooms = bedrooms;
			if (parseInt(bedrooms) > 4) {
				mappedBedrooms = '5+';
			}
			const bedroomsSelector =
				'div[aria-label="Number of bedrooms"] div[role="cell"][data-text="' +
				mappedBedrooms +
				'"]';
			await page.waitForSelector(bedroomsSelector, { timeout: 60000 });
			await page.click(bedroomsSelector);
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}

		if (bathrooms) {
			let mappedBathrooms = bathrooms;
			if (!bathrooms.endsWith('+')) {
				mappedBathrooms += '+';
			}
			if (parseFloat(bathrooms) > 4) {
				mappedBathrooms = '4+';
			}
			const bathroomsSelector =
				'div.ItemPickerGroup[aria-label="Number of bathrooms"] div[data-text="' +
				mappedBathrooms +
				'"]';
			await page.waitForSelector(bathroomsSelector, { timeout: 60000 });
			await page.click(bathroomsSelector);
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
		if (property_type) {
			const houseSelector =
				'div.bp-ItemPicker__option[role="option"]:has(label[for="' +
				property_type +
				'"])';
			await page.waitForSelector(houseSelector, { timeout: 30000 });
			await page.click(houseSelector);
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}

		if (min_sqft) {
			const sqftMinSelect = 'select[name="sqftMin"]';
			await page.waitForSelector(sqftMinSelect, { timeout: 30000 });
			await page.select(sqftMinSelect, min_sqft);
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}

		if (max_sqft) {
			const sqftMaxSelect = 'select[name="sqftMax"]';
			await page.waitForSelector(sqftMaxSelect, { timeout: 30000 });
			await page.select(sqftMaxSelect, max_sqft);
			await new Promise((resolve) => setTimeout(resolve, 1000));
		}
		const applyDivSelector =
			'div[data-rf-test-id="apply-search-options"][data-dd-action-name="filterForm_doneBtn"]';
		await page.waitForSelector(applyDivSelector, { timeout: 30000 });
		await page.click(
			`${applyDivSelector} button.bp-Button.applyButton.bp-Button__type--primary`
		);
		await new Promise((resolve) => setTimeout(resolve, 10000));

		await page.waitForSelector('div.HomeCardsContainer', { timeout: 30000 });

		const listings = await page.evaluate(() => {
			const homeCards = Array.from(
				document.querySelectorAll(
					'div.HomeCardsContainer div.HomeCardContainer'
				)
			);
			const validListings = [];
			for (const card of homeCards) {
				const imgElement = card.querySelector('img.bp-Homecard__Photo--image');
				const imgSrc = imgElement ? imgElement.src : null;

				const priceElement = card.querySelector(
					'span.bp-Homecard__Price--value'
				);
				const price = priceElement ? priceElement.textContent.trim() : null;

				const bedsElement = card.querySelector('span.bp-Homecard__Stats--beds');
				const beds = bedsElement ? bedsElement.textContent.trim() : null;

				const bathsElement = card.querySelector(
					'span.bp-Homecard__Stats--baths'
				);
				const baths = bathsElement ? bathsElement.textContent.trim() : null;
				const addressElement = card.querySelector('div.bp-Homecard__Address');
				const address = addressElement
					? addressElement.textContent.trim()
					: null;

				const keyFactsElements = card.querySelectorAll(
					'div.KeyFactsExtension span.KeyFacts-item'
				);
				const keyFacts = Array.from(keyFactsElements).map((el) =>
					el.textContent.trim()
				);
				if (imgSrc && price && beds && baths && address) {
					validListings.push({
						imageSrc: imgSrc,
						price: price,
						beds: beds,
						baths: baths,
						address: address,
						keyFacts: keyFacts,
					});
				}
				if (validListings.length >= 3) break;
			}
			return validListings;
		});

		await browser.close();
		fs.rmSync(tempDir, { recursive: true, force: true });
		return `Listings after filters: ${JSON.stringify(listings)}`;
	} catch (error) {
		console.error('Error during searchAndScrape:', error);
		throw error;
	}
};
