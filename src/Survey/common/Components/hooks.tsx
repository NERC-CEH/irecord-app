/* eslint-disable import/prefer-default-export */
import { useAlert } from 'common/flumens';

export const useSensitivityTip = () => {
  const alert = useAlert();

  const showTip = (isSelected: boolean) => {
    if (!isSelected) return;
    alert({
      header: 'Sensitivity',
      message:
        "This option will 'blur' the location details: they will be displayed as a 1 km square (rather than a precise point) and will have the site name hidden. Precise location details will be made available to verifiers and local records centres, but will not be displayed publicly.",
      buttons: [{ text: 'OK, got it' }],
    });
  };

  return showTip;
};
