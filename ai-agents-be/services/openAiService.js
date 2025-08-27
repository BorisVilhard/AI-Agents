import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
	console.error(
		'ERROR: OPENAI_API_KEY environment variable is missing or empty.'
	);
	console.error('To fix:');
	console.error('1. Obtain a key from https://platform.openai.com/api-keys');
	console.error('2. Set it in your .env file: OPENAI_API_KEY=your-key-here');
	console.error(
		'3. Or export it in terminal: export OPENAI_API_KEY=your-key-here'
	);
	throw new Error('Missing OPENAI_API_KEY - see console for details.');
}

const openai = new OpenAI({ apiKey });

export const analyzeBusiness = async (
	extractedText,
	name,
	demographic,
	instructions,
	offer
) => {
	const userPrompt = `Website content: ${extractedText}\n\nBusiness name: ${name}\nDemographic: ${demographic}\nInstructions for matching: ${instructions}\nOffer proposal: ${offer}`;

	const completion = await openai.chat.completions.create({
		model: 'gpt-4o-mini',
		messages: [
			{ role: 'system', content: SYSTEM_PROMPT },
			{ role: 'user', content: userPrompt },
		],
		response_format: { type: 'json_object' },
	});

	return JSON.parse(completion.choices[0].message.content);
};
