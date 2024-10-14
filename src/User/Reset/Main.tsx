import clsx from 'clsx';
import { mailOutline } from 'ionicons/icons';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Trans as T } from 'react-i18next';
import { TypeOf } from 'zod';
import { Main, Button } from '@flumens';
import { zodResolver } from '@hookform/resolvers/zod';
import { IonIcon } from '@ionic/react';
import { UserModel } from 'models/user';
import ControlledInput from '../common/Components/ControlledInput';

type Details = TypeOf<typeof UserModel.resetSchema>;

type Props = {
  onSubmit: SubmitHandler<Details>;
};

const ResetMain = ({ onSubmit }: Props) => {
  const { formState, handleSubmit, control } = useForm<Details>({
    defaultValues: { email: '' },
    resolver: zodResolver(UserModel.resetSchema),
  });

  return (
    <Main>
      <div className="mx-auto flex max-w-md flex-col gap-6 px-3 pt-3">
        <h2 className="my-5 text-center">
          <T>Enter your email address to request a password reset.</T>
        </h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Fake onSubmit on Enter */}
          <input type="submit" className="hidden" />

          <div className="rounded-list">
            <ControlledInput
              control={control}
              name="email"
              prefix={<IonIcon icon={mailOutline} className="size-5" />}
              type="email"
              placeholder="Email"
            />
          </div>

          <Button
            className={clsx('mx-auto my-8', !formState.isValid && 'opacity-50')}
            color="primary"
            onPress={() => handleSubmit(onSubmit)()}
          >
            Reset
          </Button>
        </form>
      </div>
    </Main>
  );
};

export default ResetMain;
