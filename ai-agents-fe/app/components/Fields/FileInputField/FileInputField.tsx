import { FieldValues, Path, useFormContext, useWatch } from 'react-hook-form';
import FieldWrapper from '../FieldWrapper/FieldWrapper';
import { ReactNode } from 'react';

interface Props<T extends FieldValues> {
	name: Path<T>;
	label?: string;
	placeholder?: string;
	defaultValue?: string;
	success?: string;
	helperText?: string;
	hasBorder?: boolean;
	border?: string;
	required?: boolean;
	disabled?: boolean;
	className?: string;
	content?: ReactNode;
}

export const FileInputField = <T extends FieldValues>(props: Props<T>) => {
	const {
		register,
		formState: { errors },
	} = useFormContext();

	const fileList = useWatch({ name: props.name }) as FileList | undefined;
	const fileName = fileList?.[0]?.name || '';

	return (
		<FieldWrapper
			label={props.label}
			className={props.className}
			success={props.success}
			error={errors[props.name]?.message as string}
			helperText={props.helperText}
			required={props.required}
			noBorder
		>
			<input
				id={props.name}
				type='file'
				style={{ display: 'none' }}
				{...register(props.name)}
			/>
			<div className='flex items-center'>
				<label
					className='border-none cursor-pointer text-text-secondary hover:text-text-primary'
					htmlFor={props.name}
				>
					{props.content || 'Upload Leads'}
				</label>
				{fileName && (
					<span className='ml-4 text-sm text-text-secondary'>{fileName}</span>
				)}
			</div>
		</FieldWrapper>
	);
};
