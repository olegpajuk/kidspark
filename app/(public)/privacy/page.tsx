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
  title: "Privacy Policy · KidSpark",
  description:
    "How KidSpark collects, uses, and protects your family's personal data.",
};

const SECTIONS = [
  { id: "who-we-are", title: "Who we are" },
  { id: "data-we-collect", title: "Data we collect" },
  { id: "childrens-data", title: "Children's data" },
  { id: "why-we-collect", title: "Why we collect it (legal basis)" },
  { id: "how-we-store", title: "How we store and secure data" },
  { id: "who-we-share-with", title: "Who we share data with" },
  { id: "data-retention", title: "Data retention" },
  { id: "your-rights", title: "Your rights" },
  { id: "cookies", title: "Cookies and tracking" },
  { id: "international-transfers", title: "International data transfers" },
  { id: "changes", title: "Changes to this policy" },
  { id: "contact", title: "How to contact us" },
];

export default function PrivacyPage() {
  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="We take the privacy of your family — and especially your children — seriously. This policy explains exactly what data we collect, why, and how we protect it."
      lastUpdated="29 April 2026"
      sections={SECTIONS}
    >
      <LegalSection id="who-we-are" number={1} title="Who we are">
        <LegalP>
          KidSpark (&ldquo;KidSpark&rdquo;, &ldquo;we&rdquo;,
          &ldquo;our&rdquo;, &ldquo;us&rdquo;) is a game-based learning
          platform for children aged 5–12, covering maths, finance, English,
          geography, and computer science. We are the data controller
          responsible for the personal data processed through the KidSpark web
          application.
        </LegalP>
        <LegalP>
          For all data protection enquiries, please contact us at:{" "}
          <Link
            href="mailto:privacy@kidspark.app"
            className="text-yellow-600 underline hover:text-yellow-700"
          >
            privacy@kidspark.app
          </Link>
        </LegalP>
        <LegalP>
          KidSpark is operated under the laws of England and Wales. We process
          personal data in compliance with the UK General Data Protection
          Regulation (UK GDPR) and the Data Protection Act 2018. Where our
          users are based in the European Economic Area (EEA), we also comply
          with EU GDPR. Where applicable, we comply with the Children&apos;s
          Online Privacy Protection Act (COPPA) for users in the United States.
        </LegalP>
      </LegalSection>

      <LegalSection id="data-we-collect" number={2} title="Data we collect">
        <LegalP>
          <LegalStrong>Account information (parent / guardian):</LegalStrong>
        </LegalP>
        <LegalUl>
          <LegalLi>
            Full name and email address (provided at registration or via Google
            sign-in)
          </LegalLi>
          <LegalLi>
            Profile photo (optional; supplied by Google if you use Google
            sign-in)
          </LegalLi>
          <LegalLi>
            Password (stored as a one-way hash by Firebase Authentication — we
            never see your password)
          </LegalLi>
          <LegalLi>Notification and communication preferences</LegalLi>
          <LegalLi>
            Consent record: the date, time, IP address, device details, and
            version of policies you accepted at signup
          </LegalLi>
        </LegalUl>

        <LegalP>
          <LegalStrong>
            Children&apos;s information (added by you):
          </LegalStrong>
        </LegalP>
        <LegalUl>
          <LegalLi>Child&apos;s first name and date of birth</LegalLi>
          <LegalLi>Child&apos;s avatar and display name</LegalLi>
          <LegalLi>
            Chosen subjects and difficulty/level preferences
          </LegalLi>
          <LegalLi>Daily time limits you configure</LegalLi>
          <LegalLi>
            Learning progress: game scores, completed exercises, stars earned,
            and session history
          </LegalLi>
          <LegalLi>
            Rewards and achievements unlocked within the app
          </LegalLi>
        </LegalUl>

        <LegalP>
          <LegalStrong>Usage and technical data:</LegalStrong>
        </LegalP>
        <LegalUl>
          <LegalLi>IP address (captured server-side at consent and sign-in)</LegalLi>
          <LegalLi>Browser type, operating system, and device identifiers</LegalLi>
          <LegalLi>
            Pages visited, games played, and session duration (via Firebase
            Analytics if enabled)
          </LegalLi>
          <LegalLi>Error logs and crash reports</LegalLi>
        </LegalUl>
      </LegalSection>

      <LegalSection id="childrens-data" number={3} title="Children's data">
        <LegalHighlight>
          KidSpark is designed for parents and guardians to manage learning for
          their children. We do not knowingly allow children to create accounts
          directly. Account holders must be 18 years of age or older.
        </LegalHighlight>

        <LegalP>
          All children&apos;s data — including names, learning progress,
          avatars, and game history — is entered by, and stored under, the
          parent or guardian&apos;s account. You are solely responsible for
          ensuring you have the appropriate authority to store data about the
          children you add to your account.
        </LegalP>

        <LegalP>
          <LegalStrong>Children&apos;s learning data:</LegalStrong> Game
          scores, session history, and progress records are stored in Firebase
          Firestore under your account&apos;s private folder, accessible only
          to your authenticated account.
        </LegalP>

        <LegalP>
          <LegalStrong>COPPA (US users):</LegalStrong> If you are located in
          the United States, we comply with the Children&apos;s Online Privacy
          Protection Act. We do not knowingly collect personal information from
          children under 13 as account holders. If you believe a child under 13
          has created an account without parental consent, please contact us at{" "}
          <Link
            href="mailto:privacy@kidspark.app"
            className="text-yellow-600 underline hover:text-yellow-700"
          >
            privacy@kidspark.app
          </Link>{" "}
          and we will delete the account promptly.
        </LegalP>
      </LegalSection>

      <LegalSection
        id="why-we-collect"
        number={4}
        title="Why we collect it (legal basis)"
      >
        <LegalUl>
          <LegalLi>
            <LegalStrong>Account data</LegalStrong> — necessary to perform the
            contract with you (provide the KidSpark service). Legal basis:{" "}
            <em>contract performance</em> (UK GDPR Article 6(1)(b)).
          </LegalLi>
          <LegalLi>
            <LegalStrong>Children&apos;s data you enter</LegalStrong> — you
            provide explicit consent for us to store and process this data when
            you create your account and add children. Legal basis:{" "}
            <em>consent</em> (UK GDPR Article 6(1)(a)) and{" "}
            <em>legitimate interests</em> in delivering the core service.
          </LegalLi>
          <LegalLi>
            <LegalStrong>Usage and technical data</LegalStrong> — used to
            operate, secure, and improve the service. Legal basis:{" "}
            <em>legitimate interests</em> (UK GDPR Article 6(1)(f)) —
            specifically our interest in maintaining a secure and functional
            service.
          </LegalLi>
          <LegalLi>
            <LegalStrong>Marketing emails</LegalStrong> — only sent if you opt
            in during signup. Legal basis: <em>consent</em> (UK GDPR Article
            6(1)(a)). You can withdraw consent at any time by unsubscribing.
          </LegalLi>
        </LegalUl>
      </LegalSection>

      <LegalSection
        id="how-we-store"
        number={5}
        title="How we store and secure data"
      >
        <LegalP>
          KidSpark is built on Google Firebase, which is ISO 27001 certified
          and SOC 2 Type II compliant. Your data is stored in Google&apos;s
          secure cloud infrastructure.
        </LegalP>

        <LegalUl>
          <LegalLi>
            <LegalStrong>Firestore (database):</LegalStrong> All structured data
            (account information, children&apos;s profiles, learning progress)
            is stored in Google Cloud Firestore with strict security rules
            enforced at the database level — only the authenticated account
            owner can read or write their own data.
          </LegalLi>
          <LegalLi>
            <LegalStrong>Firebase Authentication:</LegalStrong> Passwords are
            hashed using industry-standard algorithms. We use Firebase
            Auth&apos;s secure session management with server-verified session
            cookies.
          </LegalLi>
          <LegalLi>
            <LegalStrong>Encryption in transit:</LegalStrong> All data is
            transmitted over HTTPS/TLS. We do not support HTTP connections.
          </LegalLi>
          <LegalLi>
            <LegalStrong>Encryption at rest:</LegalStrong> All data stored in
            Firebase (Firestore) is encrypted at rest by Google.
          </LegalLi>
        </LegalUl>

        <LegalP>
          <LegalStrong>Breach notification:</LegalStrong> In the event of a
          personal data breach that is likely to result in a risk to your rights
          and freedoms, we will notify you and the relevant supervisory authority
          (the ICO in the UK) within 72 hours of becoming aware, as required by
          UK GDPR Article 33.
        </LegalP>
      </LegalSection>

      <LegalSection
        id="who-we-share-with"
        number={6}
        title="Who we share data with"
      >
        <LegalP>
          We do not sell your personal data. We only share it with the following
          service providers who help us operate KidSpark, and only to the extent
          necessary:
        </LegalP>

        <LegalUl>
          <LegalLi>
            <LegalStrong>Google Firebase (Google LLC)</LegalStrong> —
            authentication, database, and hosting infrastructure. Data may be
            stored in the United States or European Union data centres. Google
            is certified under the EU-US Data Privacy Framework.{" "}
            <Link
              href="https://firebase.google.com/support/privacy"
              target="_blank"
              className="text-yellow-600 underline"
            >
              Google Firebase Privacy
            </Link>
          </LegalLi>
        </LegalUl>

        <LegalP>
          We may also disclose your data where required by law, to comply with a
          court order, or to protect the safety of our users or the public.
        </LegalP>
      </LegalSection>

      <LegalSection id="data-retention" number={7} title="Data retention">
        <LegalUl>
          <LegalLi>
            <LegalStrong>Account and children&apos;s data:</LegalStrong>
            Retained for the lifetime of your account, plus 30 days following
            account deletion to allow for recovery in case of accidental
            deletion.
          </LegalLi>
          <LegalLi>
            <LegalStrong>Learning progress and game history:</LegalStrong>
            Retained until you delete the child profile or your account. After
            account deletion, all records are permanently removed within 30
            days.
          </LegalLi>
          <LegalLi>
            <LegalStrong>Consent records:</LegalStrong> Retained for the
            duration of your account plus 7 years, to demonstrate legal
            compliance.
          </LegalLi>
          <LegalLi>
            <LegalStrong>Server logs:</LegalStrong> Retained for up to 90 days
            for security and debugging purposes, then automatically deleted.
          </LegalLi>
        </LegalUl>
      </LegalSection>

      <LegalSection id="your-rights" number={8} title="Your rights">
        <LegalP>
          Under UK GDPR and EU GDPR, you have the following rights. To exercise
          any of them, contact us at{" "}
          <Link
            href="mailto:privacy@kidspark.app"
            className="text-yellow-600 underline hover:text-yellow-700"
          >
            privacy@kidspark.app
          </Link>
          . We will respond within 30 days.
        </LegalP>

        <LegalUl>
          <LegalLi>
            <LegalStrong>Right of access:</LegalStrong> You can request a copy
            of all personal data we hold about you and your children.
          </LegalLi>
          <LegalLi>
            <LegalStrong>Right to rectification:</LegalStrong> You can correct
            inaccurate personal data directly within the app (Settings →
            Profile) or by contacting us.
          </LegalLi>
          <LegalLi>
            <LegalStrong>
              Right to erasure (&ldquo;right to be forgotten&rdquo;):
            </LegalStrong>{" "}
            You can request deletion of your account and all associated data,
            including your children&apos;s profiles and progress. We will
            complete erasure within 30 days.
          </LegalLi>
          <LegalLi>
            <LegalStrong>Right to data portability:</LegalStrong> You can
            request an export of your data in a machine-readable format. Contact
            us at{" "}
            <Link
              href="mailto:privacy@kidspark.app"
              className="text-yellow-600 underline hover:text-yellow-700"
            >
              privacy@kidspark.app
            </Link>
            .
          </LegalLi>
          <LegalLi>
            <LegalStrong>Right to restrict processing:</LegalStrong> You can ask
            us to restrict processing of your data in certain circumstances.
          </LegalLi>
          <LegalLi>
            <LegalStrong>Right to object:</LegalStrong> You can object to
            processing based on legitimate interests at any time. You can also
            withdraw marketing consent by unsubscribing from any email we send.
          </LegalLi>
        </LegalUl>

        <LegalP>
          If you are unhappy with how we handle your data, you have the right to
          lodge a complaint with the Information Commissioner&apos;s Office
          (ICO) at{" "}
          <Link
            href="https://ico.org.uk"
            target="_blank"
            className="text-yellow-600 underline hover:text-yellow-700"
          >
            ico.org.uk
          </Link>
          .
        </LegalP>
      </LegalSection>

      <LegalSection id="cookies" number={9} title="Cookies and tracking">
        <LegalP>
          KidSpark uses a minimal set of cookies necessary to operate the
          service:
        </LegalP>

        <LegalUl>
          <LegalLi>
            <LegalStrong>Session cookie:</LegalStrong> A secure, HTTP-only
            session cookie is used to maintain your authenticated session. This
            cookie is essential and cannot be disabled without breaking the
            service.
          </LegalLi>
          <LegalLi>
            <LegalStrong>Firebase Analytics:</LegalStrong> We may use Firebase
            Analytics to understand how features are used. This data is
            aggregated and does not identify individual users. You can opt out
            of analytics by enabling &ldquo;Do Not Track&rdquo; in your browser
            or using a browser extension that blocks analytics.
          </LegalLi>
        </LegalUl>

        <LegalP>
          We do not use advertising cookies or sell data to advertising
          networks. We do not use behavioural tracking or cross-site tracking.
        </LegalP>
      </LegalSection>

      <LegalSection
        id="international-transfers"
        number={10}
        title="International data transfers"
      >
        <LegalP>
          Your data may be transferred to and processed in countries outside the
          UK and EEA, including the United States, where our infrastructure
          provider (Google Firebase) operates.
        </LegalP>
        <LegalP>
          Where data is transferred outside the UK/EEA, we rely on appropriate
          safeguards including:
        </LegalP>
        <LegalUl>
          <LegalLi>
            UK International Data Transfer Agreements (IDTAs) or EU Standard
            Contractual Clauses (SCCs)
          </LegalLi>
          <LegalLi>
            The EU-US Data Privacy Framework (where applicable)
          </LegalLi>
          <LegalLi>Adequacy decisions by the UK or EU authorities</LegalLi>
        </LegalUl>
      </LegalSection>

      <LegalSection
        id="changes"
        number={11}
        title="Changes to this policy"
      >
        <LegalP>
          We may update this Privacy Policy from time to time. When we make
          material changes, we will notify you by email (to the address on your
          account) at least 14 days before the change takes effect, or by
          displaying a prominent notice within the app.
        </LegalP>
        <LegalP>
          The &ldquo;Last updated&rdquo; date at the top of this page indicates
          when the policy was last revised. Continued use of KidSpark after the
          effective date of any change constitutes acceptance of the updated
          policy.
        </LegalP>
        <LegalP>
          The version you accepted at signup is recorded in your consent record.
        </LegalP>
      </LegalSection>

      <LegalSection id="contact" number={12} title="How to contact us">
        <LegalP>
          For all privacy-related enquiries, data subject requests, or
          complaints:
        </LegalP>
        <LegalUl>
          <LegalLi>
            <LegalStrong>Email:</LegalStrong>{" "}
            <Link
              href="mailto:privacy@kidspark.app"
              className="text-yellow-600 underline hover:text-yellow-700"
            >
              privacy@kidspark.app
            </Link>
          </LegalLi>
        </LegalUl>
        <LegalP>
          We aim to respond to all data-related requests within 30 days. For
          urgent matters relating to a suspected data breach or child safety,
          please mark your email &ldquo;URGENT&rdquo; and we will respond within
          24 hours.
        </LegalP>
      </LegalSection>
    </LegalLayout>
  );
}
