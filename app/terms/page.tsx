import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | RE",
  description: "Terms of Service for RE — the Real Estate pillar of the Globalbusiness ecosystem.",
};

const lastUpdated = "July 25, 2026";

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-accent mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-10">Last updated: {lastUpdated}</p>

        <section className="space-y-3 mb-8">
          <p>
            These Terms of Service ("Terms") govern your access to and use of RE (the
            "App" or "Service"), the Real Estate pillar of the Globalbusiness
            ecosystem, developed by Elsayed777X. By accessing or using RE, you agree to be bound
            by these Terms. If you do not agree, please do not use the Service.
          </p>
        </section>

        <Section title="1. Description of Service">
          <p>
            RE is a real estate platform that allows users to browse, buy, rent, book, invest in,
            and tokenize property listings, with payments processed through the Pi Network and,
            where applicable, recorded via smart contracts on the Pi blockchain. RE also provides
            supporting features such as an AI advisor ("Aladdin") and an admin dashboard
            for platform management.
          </p>
        </Section>

        <Section title="2. Eligibility">
          <p>
            You must be at least 18 years old and have a valid, verified Pi Network account to use
            RE's payment and transaction features. By using the Service, you represent that
            you meet these requirements and that all information you provide is accurate and
            complete.
          </p>
        </Section>

        <Section title="3. Accounts and Authentication">
          <p>
            RE uses Pi Network authentication to verify your identity. You are responsible for
            maintaining the security of your Pi Network account and for all activity that occurs
            through your authenticated session on RE. Notify us immediately of any unauthorized
            use of your account.
          </p>
        </Section>

        <Section title="4. Property Listings and Transactions">
          <ul className="list-disc list-inside space-y-1.5">
            <li>
              RE acts as a platform connecting buyers, sellers, renters, and investors; it is not
              itself a licensed real estate broker or a party to the underlying property
              transaction unless explicitly stated
            </li>
            <li>
              Users listing properties are responsible for the accuracy, legality, and ownership
              rights of the listings they submit
            </li>
            <li>
              RE does not guarantee the accuracy, condition, availability, or legal status of any
              property listed on the platform
            </li>
            <li>
              You are responsible for conducting your own due diligence before entering into any
              property transaction
            </li>
          </ul>
        </Section>

        <Section title="5. Payments, Pi Network, and Smart Contracts">
          <ul className="list-disc list-inside space-y-1.5">
            <li>
              All payments on RE are processed in Pi through the Pi Network Payments API. By
              initiating a payment, you authorize RE to submit approval and completion requests to
              Pi Network on your behalf as required to process the transaction
            </li>
            <li>
              Certain transactions (such as RE Token operations) may be executed via smart
              contracts deployed on the Pi blockchain. Once confirmed on-chain, such transactions
              are immutable and cannot be reversed by RE
            </li>
            <li>
              You are solely responsible for verifying transaction details (amount, recipient,
              property, and memo) before confirming any payment
            </li>
            <li>
              RE is not responsible for losses resulting from Pi Network outages, blockchain
              network congestion, incorrect wallet activity, or issues outside RE's reasonable
              control
            </li>
          </ul>
        </Section>

        <Section title="6. RE Token and Tokenized Assets">
          <p>
            RE Token and tokenized real estate features are provided for use within the RE
            ecosystem and, where indicated, operate on Pi Network's Testnet environment.
            Testnet tokens and transactions have no real-world monetary value and are provided for
            testing and demonstration purposes unless expressly stated otherwise.
          </p>
        </Section>

        <Section title="7. Prohibited Uses">
          <p>You agree not to:</p>
          <ul className="list-disc list-inside space-y-1.5">
            <li>Use RE for any unlawful purpose or in violation of these Terms</li>
            <li>Submit false, misleading, or fraudulent property listings or transaction data</li>
            <li>Attempt to interfere with, disrupt, or gain unauthorized access to RE's systems, admin dashboard, or smart contracts</li>
            <li>Use automated means to scrape or extract data from the Service without permission</li>
            <li>Impersonate any person or entity, or misrepresent your affiliation with any person or entity</li>
          </ul>
        </Section>

        <Section title="8. Intellectual Property">
          <p>
            All content, branding, and software associated with RE, excluding user-submitted
            listing content, are the property of Globalbusiness / Elsayed777X and are protected by
            applicable intellectual property laws. You may not copy, modify, or distribute any
            part of the Service without prior written permission.
          </p>
        </Section>

        <Section title="9. Disclaimers">
          <p>
            RE is provided on an "as is" and "as available" basis, without
            warranties of any kind, express or implied, including but not limited to merchantability,
            fitness for a particular purpose, and non-infringement. RE does not guarantee
            uninterrupted, error-free, or secure operation of the Service.
          </p>
        </Section>

        <Section title="10. Limitation of Liability">
          <p>
            To the maximum extent permitted by law, RE and its developer shall not be liable for
            any indirect, incidental, special, consequential, or punitive damages, or any loss of
            profits, revenue, data, or property value, arising out of or related to your use of
            the Service, including losses related to Pi Network payments or blockchain
            transactions.
          </p>
        </Section>

        <Section title="11. Termination">
          <p>
            We may suspend or terminate your access to RE at any time, with or without notice, if
            we believe you have violated these Terms or engaged in conduct that harms RE, its
            users, or third parties.
          </p>
        </Section>

        <Section title="12. Changes to These Terms">
          <p>
            We may revise these Terms from time to time. We will update the "Last
            updated" date above when changes are made. Continued use of RE after changes take
            effect constitutes your acceptance of the revised Terms.
          </p>
        </Section>

        <Section title="13. Governing Law">
          <p>
            These Terms are governed by and construed in accordance with applicable law, without
            regard to conflict of law principles, unless otherwise required by mandatory local
            regulations applicable to you.
          </p>
        </Section>

        <Section title="14. Contact Us">
          <p>
            If you have any questions about these Terms, please contact us at{" "}
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
