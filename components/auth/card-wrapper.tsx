"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader
} from "@/components/ui/card";
import { Header } from "@/components/auth/header";
import { Social } from "@/components/auth/social";
import { BackButton } from "@/components/auth/back-button";
import { Logo } from "../logo";

interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel: string;
  backButtonHref: string;
  showSocial?: boolean;
  type: "signIn" | "signUp" | "error";
};

export const CardWrapper = ({
  children,
  headerLabel,
  backButtonLabel,
  backButtonHref,
  showSocial,
  type
}: CardWrapperProps) => {
  return (
    <Card className="md:w-[40vw] md:h-[70vh] lg:w-[30vw] lg:h-[75vh] shadow-md">
      <CardHeader className="p-6">
        <div className="flex flex-col items-center">
          <div className="m-4">
            <Logo />
          </div>
          <p className="text-lg font-semibold text-gray-600 mb-16">
            Challenge Your Mind, One Quiz at a Time!
          </p>
        </div>
        <Header label={headerLabel} type={type} />
      </CardHeader>
      <CardContent className="pb-2">
        {children}
      </CardContent>
      {showSocial ? (
        <CardFooter>
          <Social type={type} />
        </CardFooter>
      ) : (
        <CardFooter>
          <BackButton
            label={backButtonLabel}
            href={backButtonHref}
          />
        </CardFooter>
      )}
    </Card>
  );
};
