import axios from 'axios';
import cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import { URL } from 'url';

const headers = {
	'User-Agent':
		'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
	Accept:
		'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
	'Accept-Language': 'en-US,en;q=0.9',
	'Accept-Encoding': 'gzip, deflate, br',
	Connection: 'keep-alive',
	'Upgrade-Insecure-Requests': '1',
	'Sec-Fetch-Dest': 'document',
	'Sec-Fetch-Mode': 'navigate',
	'Sec-Fetch-Site': 'none',
	'Sec-Fetch-User': '?1',
	Referer: 'https://www.google.com/',
	DNT: '1',
};

export const fetchWebsiteContent = async (website) => {
	try {
		const response = await axios.get(website, { timeout: 15000, headers });
		return response.data;
	} catch (err) {
		if (err.response && err.response.status === 403) {
			return fetchFallback(website);
		}
		throw err;
	}
};

const fetchFallback = async (website) => {
	console.warn(`Fallback: Trying about page for ${website}`);
	try {
		const aboutUrl = new URL(website);
		let aboutPath = '/about';
		if (website.toLowerCase().includes('zillow')) {
			aboutPath = '/z/corp/about/';
		} else if (website.toLowerCase().includes('midjourney')) {
			aboutPath = '/about-us';
		} else if (website.toLowerCase().includes('grok')) {
			aboutPath = '/about';
		}
		aboutUrl.pathname = aboutPath;
		const fallbackResponse = await axios.get(aboutUrl.toString(), {
			timeout: 15000,
			headers,
		});
		return fallbackResponse.data;
	} catch (fallbackErr) {
		if (fallbackErr.response && fallbackErr.response.status === 403) {
			return fetchWithPuppeteer(website);
		}
		throw fallbackErr;
	}
};

const fetchWithPuppeteer = async (website) => {
	console.warn(`Puppeteer fallback for ${website}`);
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	await page.setUserAgent(headers['User-Agent']);
	await page.setExtraHTTPHeaders({
		'Accept-Language': headers['Accept-Language'],
		Accept: headers['Accept'],
		Referer: headers['Referer'],
		DNT: headers['DNT'],
	});
	await page.goto(website, { waitUntil: 'networkidle2', timeout: 30000 });
	const html = await page.content();
	await browser.close();
	return html;
};

export const extractRelevantText = (html) => {
	const $ = cheerio.load(html);
	let text = '';

	text += $('title').text().trim() + '\n\n';

	const metaDesc = $('meta[name="description"]').attr('content');
	if (metaDesc) {
		text += metaDesc.trim() + '\n\n';
	}

	const metaKeywords = $('meta[name="keywords"]').attr('content');
	if (metaKeywords) {
		text += 'Keywords: ' + metaKeywords.trim() + '\n\n';
	}

	$('h1, h2, h3').each((i, el) => {
		text += $(el).text().trim() + '\n';
	});

	$('body')
		.find('p, div, article, section, main')
		.each((i, el) => {
			const elText = $(el).text().trim();
			if (
				elText.length > 50 &&
				!elText.includes('copyright') &&
				!elText.includes('footer')
			) {
				text += elText + '\n';
			}
		});

	const aboutLink = $('a[href*="about"], a[href*="company"]')
		.first()
		.attr('href');
	if (aboutLink) {
		text += '\nAbout page link available: ' + aboutLink;
	}

	return text.substring(0, 15000);
};
