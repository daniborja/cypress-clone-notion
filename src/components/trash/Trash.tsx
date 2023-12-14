import { CustomDialogTrigger } from '../shared';
import TrashRestore from './TrashRestore';

export type TrashProps = {
  children: React.ReactNode;
};

const Trash: React.FC<TrashProps> = ({ children }) => {
  return (
    <CustomDialogTrigger header="Trash" content={<TrashRestore />}>
      {children}
    </CustomDialogTrigger>
  );
};

export default Trash;
