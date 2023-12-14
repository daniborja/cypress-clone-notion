import clsx from 'clsx';
import { randomUUID } from 'crypto';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';

import BANNER from '../../../public/appBanner.png';
import CALENDAR from '../../../public/cal.png';
import CHECKICON from '../../../public/icons/check.svg';
import DIAMOND from '../../../public/icons/diamond.svg';
import {
  CLIENTS,
  PRICING_CARDS,
  PRICING_PLANS,
  USERS,
} from '../../lib/constants/constants';

import { CustomCard, TitleSection } from '@/components/landing-page';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui';

const HomePage = () => {
  return (
    <>
      {/* ====== Hero Section ====== */}
      <section>
        <div className="overflow-hidden px-4 sm:px-6 mt-10 sm:flex sm:flex-col gap-4 md:justify-center md:items-center">
          <TitleSection
            pill="✨ Your Workspace, Perfected"
            title="All-In-One Collaboration and Productivity Platform"
          />

          <div className="bg-white p-[2px] mt-6 rounded-xl bg-gradient-to-r from-primary to-brand-primaryBlue sm:w-[300px]">
            <Button
              variant="btn-secondary"
              className="w-full rounded-[10px] p-6 text-2xl bg-background"
            >
              Get Cypress Free
            </Button>
          </div>

          <div className="md:mt-[-90px] sm:w-full w-[750px] flex justify-center items-center mt-[-40px] relative sm:ml-0 ml-[-50px]">
            <Image
              src={BANNER}
              alt="Application Banner"
              draggable="false"
              className="unselectable"
            />
            <div className="bottom-0 top-[50%] bg-gradient-to-t dark:from-background left-0 right-0 absolute z-10"></div>
          </div>
        </div>
      </section>

      {/* ====== Logos ====== */}
      <section className="relative">
        <div
          className="overflow-hidden
          flex
          after:content['']
          after:dark:from-brand-dark
          after:to-transparent
          after:from-background
          after:bg-gradient-to-l
          after:right-0
          after:bottom-0
          after:top-0
          after:w-20
          after:z-10
          after:absolute

          before:content['']
          before:dark:from-brand-dark
          before:to-transparent
          before:from-background
          before:bg-gradient-to-r
          before:left-0
          before:top-0
          before:bottom-0
          before:w-20
          before:z-10
          before:absolute
        "
        >
          {[...Array(2)].map(() => (
            <div key={randomUUID()} className="flex flex-nowrap animate-slide">
              {CLIENTS.map(client => (
                <div
                  key={client.alt}
                  className="relative w-[200px] m-20 shrink-0 flex items-center"
                >
                  <Image
                    src={client.logo}
                    alt={client.alt}
                    width={200}
                    className="object-contain max-w-none unselectable"
                    draggable="false"
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ====== Calendar ====== */}
      <section className="px-4 pt-4 sm:px-6 flex justify-center items-center flex-col relative">
        {/* bg - absolute */}
        <div className="w-[30%] blur-[120px] rounded-full h-32 absolute bg-brand-primaryPurple/50 -z-10 top-22" />

        <TitleSection
          title="Keep track of your meetings all in one place"
          subheading="Capture your ideas, thoughts, and meeting notes in a structured and organized manner."
          pill="Features"
        />

        <div className="mt-10 max-w-[450px] flex justify-center items-center relative sm:ml-0 rounded-2xl border-8 border-washed-purple-300  border-opacity-10">
          <Image
            src={CALENDAR}
            alt="Banner"
            className="rounded-2xl unselectable"
            draggable="false"
          />
        </div>
      </section>

      {/* ====== Testimonials ====== */}
      <section className="relative">
        {/* bg - absolute */}
        <div className="w-full blur-[120px] rounded-full h-32 absolute bg-brand-primaryPurple/50 -z-100 top-56" />

        <div className="mt-20 px-4 sm:px-6 flex flex-col overflow-x-hidden overflow-visible">
          <TitleSection
            title="Trusted by all"
            subheading="Join thousands of satisfied users who rely on our platform for their 
            personal and professional productivity needs."
            pill="Testimonials"
          />

          {/* Slide */}
          {[...Array(2)].map((_, index) => (
            <div
              key={randomUUID()}
              className={twMerge(
                clsx(
                  'mt-10 flex flex-nowrap gap-6 self-start',
                  // conditional styles
                  {
                    'flex-row-reverse': index === 1,
                    'animate-[slide_250s_linear_infinite]': true,
                    'animate-[slide_250s_linear_infinite_reverse]': index === 1,
                    'ml-[100vw]': index === 1,
                  }
                ),

                'hover:paused'
              )}
            >
              {USERS.map((testimonial, index) => (
                <CustomCard
                  key={testimonial.name}
                  className="w-[500px] shrink-0s rounded-xl dark:bg-gradient-to-t dark:from-border dark:to-background"
                  ///* Card Header
                  cardHeader={
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage
                          src={`/avatars/${index + 1}.png`}
                          draggable="false"
                          className="unselectable"
                        />
                        <AvatarFallback>AV</AvatarFallback>
                      </Avatar>

                      <div>
                        <CardTitle className="text-foreground">
                          {testimonial.name}
                        </CardTitle>
                        <CardDescription className="dark:text-washed-purple-800">
                          {testimonial.name.toLocaleLowerCase()}
                        </CardDescription>
                      </div>
                    </div>
                  }
                  ///* Card Content
                  cardContent={
                    <p className="dark:text-washed-purple-800">
                      {testimonial.message}
                    </p>
                  }
                />
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ====== Pricing ====== */}
      <section className="mt-20 px-4 sm:px-6">
        <TitleSection
          title="The Perfect Plan For You"
          subheading="Experience all the benefits of our platform. Select a plan that suits your needs and take your productivity to new heights."
          pill="Pricing"
        />

        <div className="flex flex-col-reverse sm:flex-row gap-4 justify-center sm:items-stretch items-center mt-10">
          {PRICING_CARDS.map(pricingCard => (
            <CustomCard
              key={pricingCard.planType}
              className={clsx(
                'w-[300px] rounded-2xl dark:bg-black/40 background-blur-3xl relative',
                // conditional styles
                {
                  'border-brand-primaryPurple/70':
                    pricingCard.planType === PRICING_PLANS.proplan,
                }
              )}
              ///* Header
              cardHeader={
                <CardTitle className="text-2xl font-semibold">
                  {pricingCard.planType === PRICING_PLANS.proplan && (
                    <>
                      <div
                        className="hidden dark:block w-full blur-[120px] rounded-full h-32
                        absolute bg-brand-primaryPurple/80 -z-10 top-0"
                      />
                      <Image
                        src={DIAMOND}
                        alt="Pro Plan Icon"
                        className="absolute top-6 right-6 unselectable"
                        draggable="false"
                      />
                    </>
                  )}
                  {pricingCard.planType}
                </CardTitle>
              }
              ///* Content
              cardContent={
                <CardContent className="p-0">
                  <span className="font-normal text-2xl">
                    ${pricingCard.price}
                  </span>
                  {+pricingCard.price > 0 ? (
                    <span className="dark:text-washed-purple-800 ml-1">
                      /mo
                    </span>
                  ) : (
                    ''
                  )}
                  <p className="dark:text-washed-purple-800">
                    {pricingCard.description}
                  </p>
                  <Button
                    variant="btn-primary"
                    className="whitespace-nowrap w-full mt-4"
                  >
                    {pricingCard.planType === PRICING_PLANS.proplan
                      ? 'Go Pro'
                      : 'Get Started'}
                  </Button>
                </CardContent>
              }
              ///* Footer
              cardFooter={
                <ul className="font-normal flex mb-2 flex-col gap-4">
                  <small>{pricingCard.highlightFeature}</small>
                  {/* item list */}
                  {pricingCard.freatures.map(feature => (
                    <li key={feature} className="flex items-center gap-2">
                      <Image src={CHECKICON} alt="Check Icon" />
                      {feature}
                    </li>
                  ))}
                </ul>
              }
            />
          ))}
        </div>
      </section>
    </>
  );
};

export default HomePage;
