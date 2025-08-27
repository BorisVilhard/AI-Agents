import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

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
