import { WPDirType } from '@/lib/interfaces';
import { CustomDialogTrigger } from '../shared';
import BannerUploadForm from './BannerUploadForm';

export type BannerUploadProps = {
  children: React.ReactNode;
  className?: string;
  dirType: WPDirType;
  id: string;
};

const BannerUpload: React.FC<BannerUploadProps> = ({
  children,
  dirType,
  id,
  className,
}) => {
  return (
    <CustomDialogTrigger
      header="Upload Banner"
      content={<BannerUploadForm dirType={dirType} id={id} />}
      className={className}
    >
      {children}
    </CustomDialogTrigger>
  );
};

export default BannerUpload;
