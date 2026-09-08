import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form';
import { Input, InputProps } from '@flumens';

type Props<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
} & Partial<InputProps>;

const ControlledInput = <T extends FieldValues>({
  control,
  name,
  ...props
}: Props<T>) => (
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
