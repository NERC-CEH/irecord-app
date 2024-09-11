import { Controller } from 'react-hook-form';
import { Input, InputProps } from '@flumens';

type Props = { control: any; name: string } & Partial<InputProps>;

const ControlledInput = ({ control, name, ...props }: Props) => (
  <Controller
    control={control}
    name={name}
    render={({ field, fieldState }) => (
      <Input
        {...field}
        isInvalid={fieldState.invalid}
        errorMessage={fieldState.error?.message}
        {...props}
      />
    )}
  />
);

export default ControlledInput;
