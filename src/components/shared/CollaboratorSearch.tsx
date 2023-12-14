'use client';

import { Search } from 'lucide-react';
import { useRef, useState } from 'react';

import { useAuthUser } from '@/lib/hooks/useAuthUser';
import { getUsersFromSearch } from '@/lib/supabase/queries';
import { User } from '@/lib/supabase/supabase.types';
import { Loader } from '.';
import { Avatar, AvatarFallback, AvatarImage, Button, Input } from '../ui';
import { ScrollArea } from '../ui/scroll-area';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';

export type CollaboratorSearchProps = {
  existingCollaborators: User[] | [];
  getCollaborator: (collaborator: User) => void;
  children: React.ReactNode;
};

const CollaboratorSearch: React.FC<CollaboratorSearchProps> = ({
  children,
  existingCollaborators,
  getCollaborator,
}) => {
  const { user } = useAuthUser();
  const [searchResults, setSearchResults] = useState<User[] | []>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pristine, setPristine] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  ////* handlers
  const onChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (value === '') return;

    // debounce
    if (timerRef) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      if (pristine) setPristine(false);
      setIsLoading(true);

      const res = await getUsersFromSearch(value);
      setSearchResults(res);
      setIsLoading(false);
    }, 610);
  };

  const addCollaborator = (user: User) => {
    getCollaborator(user);
  };

  return (
    <Sheet>
      {/* asChild to avoid error btn inside of btn */}
      <SheetTrigger className="flex w-1/2 mx-auto" asChild>
        {children}
      </SheetTrigger>

      {/* ========= Content ========= */}
      <SheetContent className="w-[400px] sm:w-[540px]">
        {/* --- Search header --- */}
        <SheetHeader className="pb-3">
          <SheetTitle>Search Collaborator</SheetTitle>

          <SheetDescription>
            <span className="text-sm text-muted-foreground">
              You can also remove collaborators after adding them from the
              settings tab.
            </span>
          </SheetDescription>
        </SheetHeader>

        {/* --- Search bar --- */}
        <div className="flex justify-center items-center gap-2">
          <Search />
          <Input
            name="name"
            className="dark:bg-background"
            placeholder="Email"
            type="email"
            onChange={onChangeHandler}
          />
        </div>

        {/* ====== ScrollArea: Search results ====== */}
        {isLoading ? (
          <div className="center-absolute">
            <Loader />
          </div>
        ) : !!searchResults.length ? (
          <ScrollArea className="mt-6 overflow-y-auto w-full rounded-md custom-scrollbar">
            {/* filter users already included in collaborators */}
            {searchResults
              .filter(
                result =>
                  !existingCollaborators.some(
                    existing => existing.id === result.id
                  )
              )
              .filter(result => result.id !== user?.id)
              .map(user => (
                <div
                  key={user.id}
                  className="flex p-4 justify-between items-center"
                >
                  <div className="flex gap-4 items-center">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src="/avatars/7.png" />
                      <AvatarFallback>CP</AvatarFallback>
                    </Avatar>

                    <div className="text-sm gap-2 overflow-hidden overflow-ellipsis w-[180px] text-muted-foreground">
                      {user.email}
                    </div>
                  </div>

                  <Button
                    variant="secondary"
                    onClick={() => addCollaborator(user)}
                  >
                    Add
                  </Button>
                </div>
              ))}
          </ScrollArea>
        ) : (
          !pristine && (
            <div className="center-absolute">No collaborators found</div>
          )
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CollaboratorSearch;
