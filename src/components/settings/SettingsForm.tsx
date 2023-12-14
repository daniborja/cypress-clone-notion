'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {
  Briefcase,
  CreditCard,
  ExternalLink,
  Lock,
  LogOut,
  Plus,
  Share,
  UserIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { useSubscriptionModal } from '@/lib/context/ui/subscription-modal-provider';
import { useAuthUser } from '@/lib/hooks/useAuthUser';
import { useCypress } from '@/lib/hooks/useCypress';
import {
  SubscriptionStatusEnum,
  WorkspacesPermissions,
} from '@/lib/interfaces';
import {
  addCollaborators,
  deleteWorkspace,
  getCollaborators,
  removeCollaborators,
  updateWorkspace,
} from '@/lib/supabase/queries';
import { User, workspace } from '@/lib/supabase/supabase.types';
import { postData } from '@/lib/utils';
import Link from 'next/link';
import { CypressProfileIcon } from '../icons';
import { CollaboratorSearch } from '../shared';
import LogoutButton from '../shared/LogoutButton';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Input,
  Label,
} from '../ui';
import { Alert, AlertDescription } from '../ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { ScrollArea } from '../ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Separator } from '../ui/separator';
import { useToast } from '../ui/use-toast';

export type SettingsFormProps = {};

const SettingsForm: React.FC<SettingsFormProps> = () => {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const {
    state,
    workspaceId,
    updateWorkspace: updateWorkspaceContext,
    deleteWorkspace: deleteWorkspaceContext,
  } = useCypress();
  const { user, subscription } = useAuthUser();
  const { toast } = useToast();
  const { setOpen } = useSubscriptionModal();

  const [permissions, setPermissions] = useState(WorkspacesPermissions.private);
  const [collaborators, setCollaborators] = useState<User[] | []>([]);
  const [openAlertMessage, setOpenAlertMessage] = useState(false); // confirm changes modal
  const [workspaceDetails, setWorkspaceDetails] = useState<workspace>();

  // loading states
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [loadingPortal, setLoadingPortal] = useState(false);

  // debouncer to perists changes automatically
  const titleTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const isSubscriptionActive =
    subscription?.status === SubscriptionStatusEnum.active;

  //////* Effects
  useEffect(() => {
    const showingWorkspace = state.workspaces.find(
      workspace => workspace.id === workspaceId
    );
    if (showingWorkspace) setWorkspaceDetails(showingWorkspace);
  }, [workspaceId, state]);

  useEffect(() => {
    if (!workspaceId) return;

    const fetchCollaborators = async () => {
      const response = await getCollaborators(workspaceId);
      if (response.length) {
        setPermissions(WorkspacesPermissions.shared);
        setCollaborators(response);
      }
    };
    fetchCollaborators();
  }, [workspaceId]);

  /////* Workspace handler
  /// onChange workspace title
  const workspaceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!workspaceId || !e.target.value) return;

    updateWorkspaceContext({
      workspace: { title: e.target.value },
      workspaceId,
    });

    // debounce
    if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    titleTimerRef.current = setTimeout(async () => {
      await updateWorkspace({ title: e.target.value }, workspaceId);
    }, 610);
  };

  /// onChange logo
  const onChangeWorkspaceLogo = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!workspaceId || !isSubscriptionActive) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const { data, error } = await supabase.storage
      .from('workspace-logos')
      .upload(`workspaceLogo.${uuidv4}`, file, {
        cacheControl: '3600',
        upsert: true,
      });
    if (error) return;

    updateWorkspaceContext({ workspace: { logo: data.path }, workspaceId });

    await updateWorkspace({ logo: data.path }, workspaceId);
    setUploadingLogo(false);
  };

  /// onChange permissions
  const onPermissionsChange = (val: WorkspacesPermissions) => {
    if (val === 'private') {
      setOpenAlertMessage(true);
    } else setPermissions(val);
  };
  // const onPermissionsChange = (val: WorkspacesPermissions) => {
  //   if (val === WorkspacesPermissions.private) {
  //     setOpenAlertMessage(true); // TODO: check lose collaborators?
  //   }

  //   setPermissions(val);
  // };

  /// on delete workspace
  const onDeleteWorkspace = async () => {
    if (!workspaceId) return;

    await deleteWorkspace(workspaceId);
    deleteWorkspaceContext(workspaceId);
    router.replace('/dashboard'); // can't go back
    toast({ title: 'Successfully deleted your workspae' });
  };

  //////* Collaborators handler
  /// add collaborators
  const addCollaborator = async (profile: User) => {
    if (!workspaceId) return;
    if (subscription?.status !== 'active' && collaborators.length >= 2)
      return setOpen(true); // 2 collabs as limit for free plans

    await addCollaborators([profile], workspaceId);
    setCollaborators([...collaborators, profile]);
  };

  /// remove collaborators
  const removeCollaborator = async (user: User) => {
    if (!workspaceId) return;
    if (collaborators.length === 1) {
      setPermissions(WorkspacesPermissions.private);
    }
    await removeCollaborators([user], workspaceId);

    setCollaborators(
      collaborators.filter(collaborator => collaborator.id !== user.id)
    );
    router.refresh();
  };

  /// change shared to private and lose collaborators
  const onClickAlertConfirm = async () => {
    if (!workspaceId) return;
    if (collaborators.length > 0) {
      await removeCollaborators(collaborators, workspaceId);
    }
    setPermissions(WorkspacesPermissions.private);
    setOpenAlertMessage(false);
  };

  /// get subscription
  const redirectToCustomerPortal = async () => {
    setLoadingPortal(true);
    try {
      const { url, error } = await postData({
        url: '/api/create-portal-link',
      });
      window.location.assign(url);
    } catch (error) {
      console.log(error);
      setLoadingPortal(false);
    }
    setLoadingPortal(false);
  };

  /////* payments

  return (
    <div className="flex gap-4 flex-col">
      {/* ========= Header ========= */}
      <p className="flex items-center gap-2 mt-6">
        <Briefcase size={20} />
        Workspace
      </p>
      <Separator />

      {/* ========= Form ========= */}
      <div className="flex flex-col gap-[13px] pt-1">
        {/* ---- workspace name ---- */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="workspaceName"
            className="text-sm text-muted-foreground"
          >
            Name
          </Label>
          <Input
            name="workspaceName"
            id="workspaceName"
            value={workspaceDetails ? workspaceDetails.title : ''}
            placeholder="Workspace Name"
            onChange={workspaceNameChange}
          />
        </div>

        {/* ---- logo ---- */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="workspaceLogo"
            className="text-sm text-muted-foreground"
          >
            Workspace Logo
          </Label>
          <Input
            name="workspaceLogo"
            id="workspaceLogo"
            type="file"
            accept="image/*"
            placeholder="Workspace Logo"
            onChange={onChangeWorkspaceLogo}
            disabled={uploadingLogo || !isSubscriptionActive}
          />
        </div>

        {!isSubscriptionActive && (
          <small className="text-muted-foreground">
            To customize your workspace, you need to be on a{' '}
            <span className="font-bold">Pro Plan</span>
          </small>
        )}
      </div>

      {/* ========= Another settings ========= */}
      <>
        {/* ====== permission ====== */}
        <Label htmlFor="permissions" className="pt-2 pb-1">
          Permissions
        </Label>

        {/* --- Select workspace premission --- */}
        <Select onValueChange={onPermissionsChange} value={permissions}>
          <SelectTrigger className="w-full h-26 -mt-3">
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
              {/* Private */}
              <SelectItem value="private">
                <div className="p-2 flex gap-4 justify-center items-center">
                  <Lock />
                  <article className="text-left flex flex-col">
                    <span>Private</span>
                    <p>
                      Your workspace is private to you. You can choose to share
                      it later.
                    </p>
                  </article>
                </div>
              </SelectItem>

              {/* Shared */}
              <SelectItem value="shared">
                <div className="p-2 flex gap-4 justify-center items-center">
                  <Share></Share>
                  <article className="text-left flex flex-col">
                    <span>Shared</span>
                    <span>You can invite collaborators.</span>
                  </article>
                </div>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* --- Collaborators searcher & collaborators added --- */}
        {permissions === WorkspacesPermissions.shared && (
          <div>
            {/* --- Searcher --- */}
            <CollaboratorSearch
              existingCollaborators={collaborators}
              getCollaborator={user => {
                addCollaborator(user);
              }}
            >
              <Button type="button" className="text-sm mt-4">
                <Plus />
                Add Collaborators
              </Button>
            </CollaboratorSearch>

            {/* --- Collaborators List --- */}
            <div className="mt-4">
              <span className="text-sm text-muted-foreground">
                Collaborators: {collaborators.length || ''}
              </span>

              <ScrollArea className="h-[120px] overflow-y-auto w-full rounded-md border border-muted-foreground/20 custom-scrollbar">
                {collaborators.length ? (
                  collaborators.map(collaborator => (
                    <div
                      className="p-4 flex justify-between items-center custom-scrollbar"
                      key={collaborator.id}
                    >
                      <div className="flex gap-4 items-center">
                        <Avatar>
                          <AvatarImage src="/avatars/7.png" />
                          <AvatarFallback>PJ</AvatarFallback>
                        </Avatar>
                        <div className="text-sm gap-2 text-muted-foreground overflow-hidden overflow-ellipsis sm:w-[210px] w-[140px]">
                          {collaborator.email}
                        </div>
                      </div>

                      <Button
                        variant="secondary"
                        onClick={() => removeCollaborator(collaborator)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="absolute right-0 left-0 top-0 bottom-0 flex justify-center items-center">
                    <span className="text-muted-foreground text-sm">
                      You have no collaborators
                    </span>
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        )}

        {/* ====== Delete workspace ====== */}
        <Alert variant={'destructive'} className="mt-3">
          <AlertDescription>
            Warning! deleting you workspace will permanantly delete all data
            related to this workspace.
          </AlertDescription>
          <Button
            type="submit"
            size={'sm'}
            variant={'destructive'}
            className="mt-4 text-sm bg-destructive/40 border-2 border-destructive"
            onClick={onDeleteWorkspace}
          >
            Delete Workspace
          </Button>
        </Alert>

        {/* ====== Profile ====== */}
        <p className="flex items-center gap-2 mt-6">
          <UserIcon size={20} /> Profile
        </p>
        <Separator />

        <div className="flex items-center">
          <Avatar>
            <AvatarImage src={''} />
            <AvatarFallback>
              <CypressProfileIcon />
            </AvatarFallback>
          </Avatar>

          {/* --- Upload Profile Image --- */}
          <div className="flex flex-col ml-6">
            <small className="text-muted-foreground cursor-not-allowed">
              {user ? user.email : ''}
            </small>
            <Label
              htmlFor="profilePicture"
              className="text-sm text-muted-foreground"
            >
              Profile Picture
            </Label>
            <Input
              name="profilePicture"
              type="file"
              accept="image/*"
              placeholder="Profile Picture"
              disabled={uploadingProfilePic}
            />
          </div>
        </div>

        {/* ====== Profile ====== */}
        <LogoutButton>
          <div className="flex items-center">
            <LogOut />
          </div>
        </LogoutButton>

        {/* ====== Billing & Plan ====== */}
        <p className="flex items-center gap-2 mt-6">
          <CreditCard size={20} /> Billing & Plan
        </p>
        <Separator />

        <p className="text-muted-foreground">
          You are currently on a {isSubscriptionActive ? 'Pro' : 'Free'} Plan
        </p>
        <Link
          href="/"
          target="_blank"
          className="text-muted-foreground flex flex-row items-center gap-2"
        >
          View Plans <ExternalLink size={16} />
        </Link>

        {isSubscriptionActive ? (
          <div>
            <Button
              type="button"
              size="sm"
              variant={'secondary'}
              disabled={loadingPortal}
              className="text-sm"
              onClick={redirectToCustomerPortal}
            >
              Manage Subscription
            </Button>
          </div>
        ) : (
          <div>
            <Button
              type="button"
              size="sm"
              variant={'secondary'}
              className="text-sm"
              onClick={() => setOpen(true)}
            >
              Start Plan
            </Button>
          </div>
        )}

        {/* ====== Alert Dialog to confirm the change to private (lose collabs) ====== */}
        <AlertDialog open={openAlertMessage}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDescription>
                Changing a Shared workspace to a Private workspace will remove
                all collaborators permanantly.
              </AlertDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setOpenAlertMessage(false)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={onClickAlertConfirm}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    </div>
  );
};

export default SettingsForm;
