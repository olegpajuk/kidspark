import type { Metadata } from "next";
import Link from "next/link";
import {
  LegalLayout,
  LegalSection,
  LegalP,
  LegalUl,
  LegalLi,
  LegalStrong,
  LegalHighlight,
} from "@/components/shared/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Use · KidSpark",
  description:
    "The terms that govern your use of KidSpark — including account registration, children's data, and acceptable use.",
};

const SECTIONS = [
  { id: "acceptance", title: "Acceptance of terms" },
  { id: "eligibility", title: "Eligibility" },
  { id: "account", title: "Account registration and security" },
  { id: "childrens-data", title: "Children's data and parental responsibility" },
  { id: "acceptable-use", title: "Acceptable use" },
  { id: "content", title: "Your content" },
  { id: "third-party", title: "Third-party services" },
  { id: "availability", title: "Service availability" },
  { id: "liability", title: "Limitation of liability" },
  { id: "governing-law", title: "Governing law" },
  { id: "changes", title: "Changes to these terms" },
  { id: "contact", title: "Contact" },
];

export default function TermsPage() {
  return (
    <LegalLayout
      title="Terms of Use"
      subtitle="Please read these terms carefully before using KidSpark. By creating an account, you agree to be bound by them."
      lastUpdated="29 April 2026"
      sections={SECTIONS}
    >
      <LegalSection id="acceptance" number={1} title="Acceptance of terms">
        <LegalP>
          These Terms of Use (&ldquo;Terms&rdquo;) form a legally binding
          agreement between you and KidSpark (&ldquo;KidSpark&rdquo;,
          &ldquo;we&rdquo;, &ldquo;our&rdquo;, &ldquo;us&rdquo;) governing your
          use of the KidSpark web application (the &ldquo;Service&rdquo;).
        </LegalP>
        <LegalP>
          By creating an account or using the Service, you confirm that you have
          read, understood, and agree to these Terms and our{" "}
          <Link
            href="/privacy"
            className="text-yellow-600 underline hover:text-yellow-700"
          >
            Privacy Policy
          </Link>
          . If you do not agree, you must not use the Service.
        </LegalP>
      </LegalSection>

      <LegalSection id="eligibility" number={2} title="Eligibility">
        <LegalP>
          You must be at least 18 years old to create an account. By
          registering, you represent and warrant that:
        </LegalP>
        <LegalUl>
          <LegalLi>You are at least 18 years of age</LegalLi>
          <LegalLi>
            You have the legal capacity to enter into a binding contract
          </LegalLi>
          <LegalLi>
            You are the parent or legal guardian of any children whose data you
            add to your account
          </LegalLi>
          <LegalLi>
            You have the authority to consent to the collection and processing
            of data about those children
          </LegalLi>
          <LegalLi>You will use the Service only for lawful purposes</LegalLi>
        </LegalUl>
        <LegalP>
          KidSpark is intended for personal, family use. Commercial use of the
          Service requires prior written agreement from KidSpark.
        </LegalP>
      </LegalSection>

      <LegalSection
        id="account"
        number={3}
        title="Account registration and security"
      >
        <LegalP>
          You may register using your email address and a password, or via
          Google sign-in. You are responsible for:
        </LegalP>
        <LegalUl>
          <LegalLi>Keeping your password confidential</LegalLi>
          <LegalLi>All activity that occurs under your account</LegalLi>
          <LegalLi>
            Notifying us immediately if you suspect unauthorised access to your
            account
          </LegalLi>
        </LegalUl>
        <LegalP>
          You may not share your account with others or allow multiple people to
          access the Service using a single account. Each account is for one
          household only.
        </LegalP>
        <LegalP>
          We reserve the right to suspend or terminate accounts that we
          reasonably believe have been compromised or are being used in
          violation of these Terms.
        </LegalP>
      </LegalSection>

      <LegalSection
        id="childrens-data"
        number={4}
        title="Children's data and parental responsibility"
      >
        <LegalHighlight>
          KidSpark is a parent-managed platform. Children do not create their
          own accounts — parents create and manage child profiles on their
          children&apos;s behalf.
        </LegalHighlight>
        <LegalP>
          As a parent or guardian using KidSpark, you are solely responsible
          for:
        </LegalP>
        <LegalUl>
          <LegalLi>
            Ensuring you have the legal authority to add children to your
            account and store their personal data
          </LegalLi>
          <LegalLi>
            Deciding which subjects and games your children access
          </LegalLi>
          <LegalLi>
            Configuring appropriate daily time limits for your children
          </LegalLi>
          <LegalLi>
            Keeping your account credentials secure to prevent unauthorised
            access to your children&apos;s data
          </LegalLi>
          <LegalLi>
            Supervising your children&apos;s use of the Service as appropriate
            for their age
          </LegalLi>
        </LegalUl>
        <LegalP>
          By adding a child to KidSpark, you confirm that you consent to
          KidSpark storing and processing that child&apos;s data as described in
          our{" "}
          <Link
            href="/privacy"
            className="text-yellow-600 underline hover:text-yellow-700"
          >
            Privacy Policy
          </Link>
          .
        </LegalP>
      </LegalSection>

      <LegalSection id="acceptable-use" number={5} title="Acceptable use">
        <LegalP>You agree not to use the Service to:</LegalP>
        <LegalUl>
          <LegalLi>Violate any applicable law or regulation</LegalLi>
          <LegalLi>
            Upload or generate content that is illegal, harmful, threatening,
            abusive, or defamatory
          </LegalLi>
          <LegalLi>
            Infringe any intellectual property, privacy, or other rights of any
            person
          </LegalLi>
          <LegalLi>Upload malware, viruses, or malicious code</LegalLi>
          <LegalLi>
            Attempt to gain unauthorised access to any part of the Service or
            other users&apos; accounts
          </LegalLi>
          <LegalLi>
            Reverse engineer, decompile, or otherwise attempt to extract the
            source code of the Service
          </LegalLi>
          <LegalLi>
            Use automated tools (bots, scrapers) to access the Service without
            our written consent
          </LegalLi>
          <LegalLi>
            Resell, sublicence, or otherwise commercialise the Service or your
            access to it
          </LegalLi>
        </LegalUl>
        <LegalP>
          We reserve the right to investigate suspected violations and to
          suspend or terminate accounts where violations are found.
        </LegalP>
      </LegalSection>

      <LegalSection id="content" number={6} title="Your content">
        <LegalP>
          <LegalStrong>Ownership:</LegalStrong> You retain all rights to any
          content you upload or create within KidSpark (e.g., child avatars,
          profile information). We do not claim ownership of your content.
        </LegalP>
        <LegalP>
          <LegalStrong>Licence to KidSpark:</LegalStrong> By uploading content,
          you grant KidSpark a limited, non-exclusive, worldwide, royalty-free
          licence to store and process your content solely for the purpose of
          providing the Service to you. This licence ends when you delete the
          content or your account.
        </LegalP>
        <LegalP>
          <LegalStrong>Your responsibility:</LegalStrong> You represent that you
          have all necessary rights to any content you upload, and that doing so
          does not infringe any third-party rights.
        </LegalP>
      </LegalSection>

      <LegalSection id="third-party" number={7} title="Third-party services">
        <LegalP>
          KidSpark integrates with third-party services (Google Firebase and
          others). Your use of these services within KidSpark is also governed
          by their respective terms of service and privacy policies. KidSpark is
          not responsible for the practices of these third parties.
        </LegalP>
      </LegalSection>

      <LegalSection id="availability" number={8} title="Service availability">
        <LegalP>
          We aim to provide the Service 24 hours a day, 7 days a week. However,
          we do not guarantee uninterrupted availability. The Service may be
          temporarily unavailable due to:
        </LegalP>
        <LegalUl>
          <LegalLi>
            Planned maintenance (we will give reasonable advance notice where
            possible)
          </LegalLi>
          <LegalLi>Emergency maintenance or security patching</LegalLi>
          <LegalLi>
            Events outside our reasonable control (force majeure), including
            outages of our underlying infrastructure providers (Google Firebase,
            etc.)
          </LegalLi>
        </LegalUl>
        <LegalP>
          We will use reasonable efforts to restore service promptly following
          any outage. We will not be liable for any loss arising from temporary
          unavailability of the Service.
        </LegalP>
      </LegalSection>

      <LegalSection id="liability" number={9} title="Limitation of liability">
        <LegalP>To the fullest extent permitted by applicable law:</LegalP>
        <LegalUl>
          <LegalLi>
            The Service is provided &ldquo;as is&rdquo; and &ldquo;as
            available&rdquo; without warranties of any kind, express or implied,
            including fitness for a particular purpose or non-infringement.
          </LegalLi>
          <LegalLi>
            KidSpark shall not be liable for any indirect, incidental, special,
            consequential, or punitive damages, including loss of data, loss of
            profits, or emotional distress, arising from your use of or
            inability to use the Service.
          </LegalLi>
          <LegalLi>
            Our total aggregate liability to you for any claim arising under or
            in connection with these Terms shall not exceed the total amount paid
            by you to KidSpark in the 12 months preceding the claim.
          </LegalLi>
        </LegalUl>
        <LegalP>
          Nothing in these Terms limits or excludes liability for death or
          personal injury caused by our negligence, fraud or fraudulent
          misrepresentation, or any other liability that cannot be excluded or
          limited under applicable law. Your statutory rights as a consumer
          under UK law are not affected by these Terms.
        </LegalP>
      </LegalSection>

      <LegalSection id="governing-law" number={10} title="Governing law">
        <LegalP>
          These Terms are governed by and construed in accordance with the laws
          of England and Wales. Any disputes arising from these Terms shall be
          subject to the exclusive jurisdiction of the courts of England and
          Wales, except where mandatory consumer protection laws in your country
          of residence give you the right to bring proceedings in your local
          courts.
        </LegalP>
        <LegalP>
          If you are a consumer in the EU, you may also benefit from any
          mandatory provisions of the law of the country in which you are
          resident and have the right to bring proceedings in your local courts.
        </LegalP>
      </LegalSection>

      <LegalSection
        id="changes"
        number={11}
        title="Changes to these terms"
      >
        <LegalP>
          We may update these Terms at any time. When we make material changes,
          we will:
        </LegalP>
        <LegalUl>
          <LegalLi>
            Notify you by email at least 14 days before the change takes effect
          </LegalLi>
          <LegalLi>Display a prominent notice within the app</LegalLi>
          <LegalLi>
            Update the &ldquo;Last updated&rdquo; date at the top of this page
          </LegalLi>
        </LegalUl>
        <LegalP>
          If you do not agree to the updated Terms, you must stop using the
          Service before the effective date. Continued use constitutes
          acceptance of the updated Terms.
        </LegalP>
      </LegalSection>

      <LegalSection id="contact" number={12} title="Contact">
        <LegalP>For questions about these Terms or the Service:</LegalP>
        <LegalUl>
          <LegalLi>
            <LegalStrong>General support:</LegalStrong>{" "}
            <Link
              href="mailto:support@kidspark.app"
              className="text-yellow-600 underline hover:text-yellow-700"
            >
              support@kidspark.app
            </Link>
          </LegalLi>
          <LegalLi>
            <LegalStrong>Privacy & data:</LegalStrong>{" "}
            <Link
              href="mailto:privacy@kidspark.app"
              className="text-yellow-600 underline hover:text-yellow-700"
            >
              privacy@kidspark.app
            </Link>
          </LegalLi>
        </LegalUl>
      </LegalSection>
    </LegalLayout>
  );
}
