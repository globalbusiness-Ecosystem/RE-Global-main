import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | RE",
  description: "Privacy Policy for RE — the Real Estate pillar of the Globalbusiness ecosystem.",
};

const lastUpdated = "July 25, 2026";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-accent mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: {lastUpdated}</p>

        <section className="space-y-3 mb-8">
          <p>
            RE ("RE", "we", "us", or "our") is the Real Estate
            pillar of the Globalbusiness ecosystem, providing a platform for browsing, buying,
            renting, tokenizing, and investing in real estate through Pi Network payments and
            blockchain-based smart contracts. This Privacy Policy explains how we collect, use,
            disclose, and safeguard your information when you use the RE application (the
            "App" or "Service"), whether accessed through the Pi Browser or the
            web.
          </p>
          <p>
            By using RE, you agree to the collection and use of information in accordance with
            this policy. If you do not agree with the terms of this Privacy Policy, please do not
            access or use the Service.
          </p>
        </section>

        <Section title="1. Information We Collect">
          <SubHeading>a. Information from Pi Network</SubHeading>
          <p>
            When you authenticate through the Pi Network SDK, we receive limited profile
            information from Pi Network, such as your Pi username and a unique user identifier,
            in accordance with the permission scopes (e.g. <Code>username</Code>,{" "}
            <Code>payments</Code>) you approve at the time of login. We do not receive your Pi
            wallet's private keys or seed phrase — these remain solely under your control
            within the Pi ecosystem.
          </p>
          <SubHeading>b. Transaction and Payment Data</SubHeading>
          <p>
            When you initiate a payment for a property purchase, rental, booking, investment, or
            tokenized asset, we process payment identifiers, transaction amounts, memos, and
            metadata (such as the property involved and transaction type) required to create,
            approve, and complete the payment through the Pi Platform API and, where applicable,
            record it on the Pi blockchain via our smart contracts.
          </p>
          <SubHeading>c. Property and Listing Information</SubHeading>
          <p>
            If you list, manage, or interact with property listings on RE, we collect the
            information you provide, such as property details, location, pricing, images, and
            related documents.
          </p>
          <SubHeading>d. Usage Data</SubHeading>
          <p>
            We automatically collect certain information when you access the Service, including
            device type, browser type, pages visited, and general usage patterns, to help us
            maintain and improve the App.
          </p>
        </Section>

        <Section title="2. How We Use Your Information">
          <ul className="list-disc list-inside space-y-1.5">
            <li>To authenticate you and operate your account within RE</li>
            <li>To process, verify, and complete Pi payments and smart contract transactions</li>
            <li>To display, manage, and facilitate real estate listings and transactions</li>
            <li>To provide the Aladdin AI advisor and other in-app features</li>
            <li>To detect, prevent, and address technical issues, fraud, or abuse</li>
            <li>To communicate with you about your transactions or the Service</li>
            <li>To comply with applicable legal obligations</li>
          </ul>
        </Section>

        <Section title="3. Blockchain and Payment Data">
          <p>
            RE integrates with the Pi Network for payments and, in part, with Pi Testnet smart
            contracts for tokenized real estate transactions. Please be aware that transactions
            recorded on a blockchain are, by their nature, public and immutable. Any transaction
            data written to the blockchain (such as payment identifiers or transaction hashes)
            cannot be altered or deleted by RE once confirmed.
          </p>
        </Section>

        <Section title="4. How We Share Your Information">
          <p>We do not sell your personal information. We may share information with:</p>
          <ul className="list-disc list-inside space-y-1.5">
            <li>Pi Network, to authenticate users and process payments</li>
            <li>
              Service providers who help us operate the App (such as hosting and infrastructure
              providers), under obligations of confidentiality
            </li>
            <li>Other users, limited to information necessary to complete a transaction (e.g. a property seller and buyer)</li>
            <li>Authorities, where required by law or to protect our rights and users' safety</li>
          </ul>
        </Section>

        <Section title="5. Data Security">
          <p>
            We apply reasonable technical and organizational measures — including encryption of
            sensitive data at rest, restricted admin access, and audit logging — to protect your
            information. However, no method of transmission or storage is completely secure, and
            we cannot guarantee absolute security.
          </p>
        </Section>

        <Section title="6. Data Retention">
          <p>
            We retain personal and transaction data for as long as necessary to provide the
            Service, comply with legal obligations, resolve disputes, and enforce our agreements.
            Blockchain transaction records may persist indefinitely as part of the underlying
            network.
          </p>
        </Section>

        <Section title="7. Your Choices and Rights">
          <p>
            Depending on your jurisdiction, you may have rights to access, correct, or request
            deletion of your personal information, where such information is not required to be
            retained for legal, security, or blockchain-integrity reasons. To exercise these
            rights, contact us using the details below.
          </p>
        </Section>

        <Section title="8. Children's Privacy">
          <p>
            RE is not directed to individuals under the age of 18. We do not knowingly collect
            personal information from children. If you believe a child has provided us with
            personal information, please contact us so we can take appropriate action.
          </p>
        </Section>

        <Section title="9. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material
            changes by updating the "Last updated" date above and, where appropriate,
            through an in-app notice. Continued use of RE after changes take effect constitutes
            acceptance of the revised policy.
          </p>
        </Section>

        <Section title="10. Contact Us">
          <p>
            If you have questions about this Privacy Policy or how your information is handled,
            please contact us at{" "}
            <a href="mailto:globalbusiness435@gmail.com" className="text-accent underline">
              globalbusiness435@gmail.com
            </a>
            .
          </p>
        </Section>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-accent mb-3">{title}</h2>
      <div className="space-y-3 text-foreground/90 leading-relaxed">{children}</div>
    </section>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="font-medium text-foreground mt-4 mb-1">{children}</h3>;
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="bg-background/60 border border-border rounded px-1.5 py-0.5 text-sm">
      {children}
    </code>
  );
}
