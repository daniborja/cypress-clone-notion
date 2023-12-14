'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';

import { cn } from '@/lib/utils';
import LOGO from '../../../public/cypresslogo.svg';

import { components } from '.';
import { Button } from '../ui';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '../ui/navigation-menu';

export type HeaderProps = {};

const Header: React.FC<HeaderProps> = () => {
  const [path, setPath] = useState('#products');

  return (
    <header className="p-4 flex justify-center items-center">
      {/* ====== Logo ====== */}
      <Link href="/" className="w-full flex gap-2 justify-left items-center">
        <Image src={LOGO} alt="Cypress Logo" width={25} height={25} />
        <span className="font-semibold dark:text-white">cypress.</span>
      </Link>

      {/* ====== Navbar ====== */}
      <NavigationMenu className="hidden md:block">
        <NavigationMenuList className="gap-6">
          {/* -- Resources  -- */}
          <NavigationMenuItem>
            <NavigationMenuTrigger
              onClick={() => setPath('#resources')}
              className={cn({
                'dark:text-white': path === '#resources',
                'dark:text-white/40': path !== '#resources',
                'font-normal': true,
                'text-xl': true,
              })}
            >
              Resources
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-6 md:w-[400px] ld:w-[500px] lg:grid-cols-[.75fr_1fr]">
                <li className="row-span-3">
                  <span className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md">
                    Welcome
                  </span>
                </li>

                <ListItem href="#" title="Introduction">
                  Re-usable components built using Radix UI and Tailwind CSS.
                </ListItem>
                <ListItem href="#" title="Installation">
                  How to install dependencies and structure your app.
                </ListItem>
                <ListItem href="#" title="Typography">
                  Styles for headings, paragraphs, lists...etc
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* -- Pricing  -- */}
          <NavigationMenuItem>
            <NavigationMenuTrigger
              onClick={() => setPath('#pricing')}
              className={cn({
                'dark:text-white': path === '#pricing',
                'dark:text-white/40': path !== '#pricing',
                'font-normal': true,
                'text-xl': true,
              })}
            >
              Pricing
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:grid-row-2">
                <ListItem title="Pro Plan" href={'#'}>
                  Unlock full power with collaboration.
                </ListItem>
                <ListItem title={'free Plan'} href={'#'}>
                  Great for teams just starting out.
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* -- s -- */}
          <NavigationMenuItem>
            <NavigationMenuContent>
              <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                {components.map(component => (
                  <ListItem
                    key={component.title}
                    title={component.title}
                    href={component.href}
                  >
                    {component.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* -- Testimonials -- */}
          <NavigationMenuItem>
            <NavigationMenuLink
              className={cn(navigationMenuTriggerStyle(), {
                'dark:text-white': path === '#testimonials',
                'dark:text-white/40': path !== '#testimonials',
                'font-normal': true,
                'text-xl': true,
              })}
            >
              Testimonial
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* -- Auth Btns  -- */}
      <aside className="flex w-full gap-2 justify-end">
        <Link href={'/login'}>
          <Button variant="btn-secondary" className=" p-1 hidden sm:block">
            Login
          </Button>
        </Link>
        <Link href="/signup">
          <Button variant="btn-primary" className="whitespace-nowrap">
            Sign Up
          </Button>
        </Link>
      </aside>
    </header>
  );
};

export default Header;




const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'group block select-none space-y-1 font-medium leading-none'
          )}
          {...props}
        >
          <div className="text-white text-sm font-medium leading-none">
            {title}
          </div>
          <p className="group-hover:text-white/70 line-clamp-2 text-sm leading-snug text-white/40">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});

ListItem.displayName = 'ListItem';
