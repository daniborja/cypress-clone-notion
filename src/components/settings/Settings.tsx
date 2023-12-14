import { CustomDialogTrigger } from '../shared';
import SettingsForm from './SettingsForm';

export type SettingsProps = {
  children: React.ReactNode;
};

const Settings: React.FC<SettingsProps> = ({ children }) => {
  return (
    <CustomDialogTrigger header="Settings" content={<SettingsForm />}>
      {children}
    </CustomDialogTrigger>
  );
};

export default Settings;
