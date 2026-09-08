/** ****************************************************************************
 * User model describing the user model on backend. Persistent.
 **************************************************************************** */
import { useContext } from 'react';
import { observable } from 'mobx';
import { z, object } from 'zod';
import {
  DrupalUserModel,
  device,
  useToast,
  useLoader,
  useAlert,
  type DrupalUserModelData,
  type DrupalUserModelOptions,
} from '@flumens';
import { NavContext } from '@ionic/react';
import { setUser } from '@sentry/browser';
import CONFIG from 'common/config';
import { mainStore } from '../store';
import activitiesExt, {
  type ActivitiesExtension,
  type Activity,
} from './activitiesExt';

export type Data = {
  firstName?: string;
  lastName?: string;
  email?: string;
  statistics: Record<string, number> | null;
  activities: Activity[];
} & DrupalUserModelData;

const defaults: Data = {
  firstName: '',
  lastName: '',
  email: '',

  statistics: null,
  activities: [],
};

export class UserModel extends DrupalUserModel<Data> {
  static registerSchema = object({
    email: z.string().email('Please fill in'),
    password: z.string().min(1, 'Please fill in'),
    firstName: z.string().min(1, 'Please fill in'),
    secondName: z.string().min(1, 'Please fill in'),
  });

  static resetSchema = object({
    email: z.string().email('Please fill in'),
  });

  static loginSchema = object({
    email: z.string().email('Please fill in'),
    password: z.string().min(1, 'Please fill in'),
  });

  uploadCounter = observable({ count: 0 });

  declare activities: ActivitiesExtension['activities'];

  declare syncActivities: ActivitiesExtension['syncActivities'];

  declare hasActivityExpired: ActivitiesExtension['hasActivityExpired'];

  constructor(options: DrupalUserModelOptions<Data>) {
    super({ ...options, data: { ...defaults, ...options.data } });
    Object.assign(this, activitiesExt);

    const checkForValidation = () => {
      if (this.isLoggedIn() && !this.data.verified) {
        console.log('User: refreshing profile for validation');
        this.refreshProfile();
      }
    };
    this.ready?.then(checkForValidation);
  }

  async logIn(email: string, password: string) {
    await super.logIn(email, password);

    if (this.id) setUser({ id: this.id });
  }

  getPrettyName() {
    return this.isLoggedIn()
      ? `${this.data.lastName}, ${this.data.firstName}`
      : '';
  }

  async checkActivation() {
    if (!this.isLoggedIn()) return false;

    if (!this.data.verified) {
      try {
        await this.refreshProfile();
      } catch (e) {
        // do nothing
      }

      if (!this.data.verified) return false;
    }

    return true;
  }

  async resendVerificationEmail() {
    if (!this.isLoggedIn() || this.data.verified) return false;

    await this._sendVerificationEmail();

    return true;
  }

  reset() {
    this.uploadCounter.count = 0;

    return super.reset(defaults);
  }
}

const userModel = new UserModel({
  cid: 'user',
  store: mainStore,
  config: CONFIG.backend,
});

export const useUserStatusCheck = () => {
  const { navigate } = useContext(NavContext);
  const toast = useToast();
  const loader = useLoader();
  const alert = useAlert();

  const check = async () => {
    if (!device.isOnline) {
      toast.warn('Looks like you are offline!');
      return false;
    }

    if (!userModel.isLoggedIn()) {
      navigate('/user/login');
      return false;
    }

    if (!userModel.data.verified) {
      await loader.show('Please wait...');
      const isVerified = await userModel.checkActivation();
      loader.hide();

      if (!isVerified) {
        const resendVerificationEmail = async () => {
          await loader.show('Please wait...');
          try {
            await userModel.resendVerificationEmail();
            toast.success(
              'A new verification email was successfully sent now. If you did not receive the email, then check your Spam or Junk email folders.'
            );
          } catch (error) {
            toast.error(error instanceof Error ? error : String(error));
          }
          loader.hide();
        };

        alert({
          header: "Looks like your email hasn't been verified yet.",
          message: 'Should we resend the verification email?',
          buttons: [
            {
              text: 'Cancel',
              role: 'cancel',
            },
            {
              text: 'Resend',
              handler: resendVerificationEmail,
            },
          ],
        });

        return false;
      }
    }

    return true;
  };

  return check;
};

export default userModel;
