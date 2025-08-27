import Button from '@/app/components/Button/Button';
import { FileInputField } from '@/app/components/Fields/FileInputField/FileInputField';
import InputField from '@/app/components/Fields/InputField/InputField';
import TextAreaField from '@/app/components/Fields/TextAreaField/TextAreaField';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { schema } from '../SalesLeadsAgent';

type LeadFormData = z.infer<typeof schema>;

function LeadForm({
	onSubmit,
	loading,
	loggedIn,
}: {
	onSubmit: (data: LeadFormData) => Promise<void>;
	loading: boolean;
	loggedIn: boolean;
}) {
	const form = useForm<LeadFormData>({
		resolver: zodResolver(schema),
		defaultValues: {
			instructions: '',
			offer: '',
		},
	});

	return (
		<FormProvider {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
				<FileInputField name='file' label='Upload Excel File' />
				<InputField
					name='instructions'
					label='Business type: (e.g., "Food delivery")'
					type='text'
					placeholder='Enter instructions here'
				/>
				<TextAreaField
					name='offer'
					label='Offer Proposal'
					placeholder='Enter your offer proposal here'
				/>
				<Button
					type='secondary'
					size='large'
					block
					htmlType='submit'
					disabled={loading || !loggedIn}
					className='hover:bg-primary-50 transition-colors duration-300 hover:scale-105 transform'
				>
					{loading ? <>Processing...</> : 'Process Leads'}
				</Button>
			</form>
		</FormProvider>
	);
}

export default LeadForm;
