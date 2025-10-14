"use client";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import Header from "@/components/auth/header";
import Social from "@/components/auth/social";
import BackButton from "@/components/auth/back-button";
import { SITE_URL } from "@/lib/constants/env";

interface CardWrapperProps {
  children: React.ReactNode;
  cardTitle: string;
  // cardTitleLink?: string;
  headerLabel: string;
  backButtonLabel?: string;
  backButtonLinkLabel: string;
  backButtonHref: string;
  showSocial?: boolean;
}

export default function CardWrapper({
  children,
  cardTitle,
  headerLabel,
  backButtonLabel,
  backButtonLinkLabel,
  backButtonHref,
  showSocial,
}: CardWrapperProps) {
  const EnableLink = false; // Set to true to enable link
  return (
    <Card className="w-[400px] shadow-md">
      <CardHeader className="text-center">
        {EnableLink ? (
          <Header title={cardTitle} link={SITE_URL} label={headerLabel} />
        ) : (
          <Header title={cardTitle} link={"disabled"} label={headerLabel} />
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
      {showSocial && (
        <CardFooter>
          <Social />
        </CardFooter>
      )}
      {backButtonLabel !== "hide" && (
        <CardFooter>
          <BackButton
            labelText={backButtonLabel}
            labelLink={backButtonLinkLabel}
            href={backButtonHref}
          />
        </CardFooter>
      )}
    </Card>
  );
}
