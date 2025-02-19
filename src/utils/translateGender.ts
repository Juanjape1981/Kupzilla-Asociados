import { useTranslation } from 'react-i18next';

// Función para traducir el género
export const translateGender = (gender: string) => {
  const { t } = useTranslation();

  if (gender === 'Masculino') {
    return t('profile.male');
  }
  if (gender === 'Femenino') {
    return t('profile.female');
  }
  return gender;
};
