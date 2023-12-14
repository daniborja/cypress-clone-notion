'use client';

import { useEffect, useState } from 'react';

import { useAuthUser } from '@/lib/hooks/useAuthUser';
import { useCypress } from '@/lib/hooks/useCypress';
import { workspace } from '@/lib/supabase/supabase.types';
import { CustomDialogTrigger, WorkspaceCreator } from '../shared';
import SelectedWorkspace from './SelectedWorkspace';

export type WorkspaceDropdownProps = {
  privateWorkspaces: workspace[];
  sharedWorkspaces: workspace[];
  collaboratingWorkspaces: workspace[];
  defaultValue: workspace | undefined;
};

const WorkspaceDropdown: React.FC<WorkspaceDropdownProps> = ({
  privateWorkspaces,
  collaboratingWorkspaces,
  sharedWorkspaces,
  defaultValue,
}) => {
  const { state, setMyWorkspaces } = useCypress();

  const [selectedOption, setSelectedOption] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);

  // set my workspaces to ContextProvider. This action must be done in UseClient FC
  useEffect(() => {
    if (!state.workspaces.length) {
      setMyWorkspaces({
        privateWorkspaces,
        collaboratingWorkspaces,
        sharedWorkspaces,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collaboratingWorkspaces, privateWorkspaces, sharedWorkspaces, state]);

  // upd local state when change state context provider
  // TODO: set workspaces in Zustand
  useEffect(() => {
    const findSelectedWorkspace = state.workspaces.find(
      workspace => workspace.id === defaultValue?.id
    );
    if (findSelectedWorkspace) setSelectedOption(findSelectedWorkspace);
  }, [state, defaultValue]);

  ///* handlers
  const handleSelect = (option: workspace) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  useAuthUser();

  return (
    <div className="relative inline-block text-left pb-3">
      {/* ====== Workspace selector ====== */}
      <div>
        <span onClick={() => setIsOpen(!isOpen)}>
          {selectedOption ? (
            <SelectedWorkspace workspace={selectedOption} />
          ) : (
            'Select a workspace'
          )}
        </span>
      </div>

      {/* ====== Workspace selector ====== */}
      {isOpen && (
        <div className="origin-top-right absolute !w-[246px] rounded-md shadow-md z-50 h-[190px] bg-black/10 backdrop-blur-lg group border-[1px] border-muted overflow-y-auto custom-scrollbar">
          <div className="rounded-md flex flex-col">
            <div className="!p-2">
              {/* --- private workspaces --- */}
              {!!privateWorkspaces.length && (
                <>
                  <p className="text-muted-foreground">Private</p>
                  <hr></hr>
                  {privateWorkspaces.map(option => (
                    <SelectedWorkspace
                      key={option.id}
                      workspace={option}
                      onClick={handleSelect}
                    />
                  ))}
                </>
              )}

              {/* --- shared workspaces --- */}
              {!!sharedWorkspaces.length && (
                <>
                  <p className="text-muted-foreground">Shared</p>
                  <hr />
                  {sharedWorkspaces.map(option => (
                    <SelectedWorkspace
                      key={option.id}
                      workspace={option}
                      onClick={handleSelect}
                    />
                  ))}
                </>
              )}

              {/* --- collaborating workspaces --- */}
              {!!collaboratingWorkspaces.length && (
                <>
                  <p className="text-muted-foreground">Collaborating</p>
                  <hr />
                  {collaboratingWorkspaces.map(option => (
                    <SelectedWorkspace
                      key={option.id}
                      workspace={option}
                      onClick={handleSelect}
                    />
                  ))}
                </>
              )}
            </div>

            {/* ====  Workspace Creator ==== */}
            <CustomDialogTrigger
              header="Create A Workspace"
              content={<WorkspaceCreator />}
              description="Workspaces give you the power to collaborate with others. You can change your workspace privacy settings after creating the workspace too."
            >
              <div className="flex transition-all hover:bg-muted justify-center items-center gap-2 p-2 w-full">
                <article className="text-slate-500 rounded-full bg-slate-800 w-4 h-4 flex items-center justify-center">
                  +
                </article>
                Create workspace
              </div>
            </CustomDialogTrigger>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkspaceDropdown;
