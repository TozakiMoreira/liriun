import Link from "next/link";

export function TermosBodyEN() {
  return (
    <>
      <h2>1. Acceptance</h2>
      <p>
        By checking the consent box at sign-up and using Liriun, you declare that you{" "}
        <strong>have read, understood and fully agree</strong> with these Terms and with the{" "}
        <Link href="/privacidade">Privacy Policy</Link>. Sign-up is only completed upon active
        check of the box, and the acceptance, date, time and originating IP are recorded
        electronically as proof of informed consent. If you disagree,{" "}
        <strong>do not complete the sign-up nor use the service</strong>.
      </p>

      <h2>2. Provider identification</h2>
      <ul>
        <li><strong>Service:</strong> Liriun — voice-first personal task assistant</li>
        <li><strong>Responsible:</strong> Pedro Tozaki</li>
        <li><strong>CNPJ (BR tax ID):</strong> [TBD — registration in progress]</li>
        <li><strong>Headquarters:</strong> São Paulo, SP, Brazil</li>
        <li><strong>Support:</strong> contato@liriun.com</li>
        <li><strong>Privacy contact:</strong> privacidade@liriun.com</li>
      </ul>

      <h2>3. Object</h2>
      <p>
        Liriun is a <strong>software as a service (SaaS)</strong> that lets you register
        tasks, organize them by category, priority and due date, and use AI (Google Gemini)
        to extract tasks from free-form text or audio. The V1 release is offered{" "}
        <strong>free of charge</strong>. Free-of-charge does not waive the application of
        Brazilian Consumer Code (CDC) when the user qualifies as a consumer.
      </p>

      <h2>4. Sign-up</h2>
      <h3>4.1 Requirements</h3>
      <ul>
        <li>Be at least 18 years old.</li>
        <li>Provide a valid e-mail, real name and password.</li>
        <li>Accept these Terms and the Privacy Policy.</li>
      </ul>
      <h3>4.2 Account responsibility</h3>
      <ul>
        <li>Keep your password secure and confidential.</li>
        <li>Do not share credentials with third parties.</li>
        <li>Notify us immediately if unauthorized use is detected.</li>
        <li>Keep account data up to date.</li>
      </ul>

      <h2>5. Acceptable use</h2>
      <p>The following is forbidden:</p>
      <ul>
        <li>Using the service for illegal, fraudulent or abusive purposes.</li>
        <li>Inserting content that infringes third-party rights.</li>
        <li>Inserting offensive, discriminatory or violent content.</li>
        <li>Violating or bypassing security mechanisms.</li>
        <li>Reverse engineering, except where legally permitted.</li>
        <li>Bots, scrapers or abusive automation.</li>
        <li>Reselling or redistributing the service without authorization.</li>
        <li>Spam, phishing, unsolicited communication.</li>
      </ul>
      <p>
        Violation may lead to account suspension or deletion, with due process and
        proportionality observed.
      </p>

      <h2>6. User content</h2>
      <h3>6.1 Ownership</h3>
      <p>Tasks, notes, audio and images <strong>remain your property</strong>.</p>
      <h3>6.2 License granted to Liriun</h3>
      <p>
        You grant Liriun a <strong>free, non-exclusive, limited and revocable</strong>{" "}
        license to store, process and display this content{" "}
        <strong>strictly to operate the service for you</strong> (including sending content
        to the Google Gemini API when you use Liriun Mode). Content will <strong>not</strong>{" "}
        be used to train AI models, advertising or commercial sharing.
      </p>

      <h2>7. Artificial intelligence</h2>
      <ul>
        <li>Liriun Mode uses Google Gemini to generate <strong>suggestions</strong>.</li>
        <li>AI can <strong>err, omit, hallucinate or misinterpret</strong>. Review before saving.</li>
        <li>Liriun is not liable for decisions made based on AI outputs.</li>
        <li>You may opt out of Liriun Mode and continue in manual mode.</li>
      </ul>

      <h2>8. Availability</h2>
      <ul>
        <li>No 24/7 availability guarantee or specific SLA in the free V1.</li>
        <li>Scheduled maintenance and third-party providers may impact the service.</li>
        <li>
          We reserve the right to <strong>change, suspend or discontinue</strong> features,
          with reasonable notice when feasible.
        </li>
      </ul>

      <h2>9. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by applicable law and respecting the binding rules of
        the Brazilian Consumer Code, Liriun is not liable for losses caused exclusively by
        third-party provider failures, cyberattacks not preventable with available
        techniques, fortuitous events or force majeure. The limitations <strong>do not
        apply</strong> in cases of willful misconduct, gross negligence or LGPD violation.
      </p>

      <h2>10. Termination</h2>
      <p>
        You may close your account at any time via Settings → Delete account. Liriun may
        terminate the relationship for breach of these Terms, with due process and prior
        notice when applicable.
      </p>

      <h2>11. Changes</h2>
      <p>
        Material updates will be communicated at least 30 days in advance by e-mail and
        in-app. Continued use after the effective date implies acceptance.
      </p>

      <h2>12. Governing law and venue</h2>
      <p>
        These Terms are governed by the laws of the Federative Republic of Brazil. The forum
        of the consumer's domicile is elected to settle disputes arising from these Terms.
      </p>
    </>
  );
}
