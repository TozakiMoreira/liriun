export function PrivacidadeBodyEN() {
  return (
    <>
      <h2>1. Who we are</h2>
      <ul>
        <li><strong>Data controller:</strong> ToMore</li>
        <li><strong>CNPJ (BR tax ID):</strong> [TBD — registration in progress]</li>
        <li><strong>Headquarters:</strong> São Paulo, SP, Brazil</li>
        <li>
          <strong>Data Protection Officer (DPO):</strong>{" "}
          <a href="mailto:privacidade@liriun.com" target="_blank" rel="noopener noreferrer">privacidade@liriun.com</a>
        </li>
      </ul>
      <p>
        This policy describes how we collect, use, store, share and protect your personal
        data when you use Liriun, in compliance with the{" "}
        <strong>Brazilian General Data Protection Law (LGPD, Law 13.709/2018)</strong>.
      </p>

      <h2>2. Data we collect</h2>
      <h3>2.1 Provided by you</h3>
      <ul>
        <li><strong>Sign-up:</strong> name, e-mail, password (always hashed, never plaintext).</li>
        <li><strong>Profile:</strong> optional photo.</li>
        <li>
          <strong>Content:</strong> tasks, categories, notes, dates, priorities, captured
          texts/audios.
        </li>
      </ul>
      <h3>2.2 Collected automatically</h3>
      <ul>
        <li>
          <strong>Technical logs:</strong> IP, user-agent, timestamps — under art. 15 of the
          Brazilian Internet Bill of Rights.
        </li>
        <li>
          <strong>Cookies / local storage:</strong> authentication session and UI
          preferences. No third-party cookies for advertising tracking.
        </li>
      </ul>
      <h3>2.3 Operators that process data</h3>
      <ul>
        <li>
          <strong>Google Gemini API (Google LLC):</strong> Liriun Mode content is processed
          by Google.{" "}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
            Google's policy
          </a>
          .
        </li>
        <li>
          <strong>Supabase Inc.:</strong> managed PostgreSQL database and authentication.{" "}
          <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">
            Supabase's policy
          </a>
          .
        </li>
        <li>
          <strong>Cloudflare, Inc.:</strong> site hosting and CDN (Cloudflare Pages).{" "}
          <a href="https://www.cloudflare.com/privacypolicy/" target="_blank" rel="noopener noreferrer">
            Cloudflare Policy
          </a>
          .
        </li>
        <li>
          <strong>Render (Render Services, Inc.):</strong> backend (API) hosting.{" "}
          <a href="https://render.com/privacy" target="_blank" rel="noopener noreferrer">
            Render Policy
          </a>
          .
        </li>
      </ul>

      <h2>3. Purposes and legal bases</h2>
      <ul>
        <li><strong>Sign-up, login and account access</strong> — contract performance (art. 7, V).</li>
        <li><strong>Storing and organizing your tasks</strong> — contract performance (art. 7, V).</li>
        <li><strong>Processing text/audio with AI (Liriun Mode)</strong> — contract performance (art. 7, V).</li>
        <li><strong>Diagnostics, security, fraud prevention</strong> — legitimate interest (art. 7, IX).</li>
        <li><strong>Application log retention</strong> — legal obligation (art. 7, II + Internet Bill art. 15).</li>
      </ul>
      <p>
        <strong>We do not use your data for</strong> training AI models, behavioral
        advertising or commercial sharing.
      </p>

      <h2>4. Automated decisions and AI (LGPD art. 20)</h2>
      <ul>
        <li>Liriun Mode only <strong>suggests</strong> — every creation or edit requires your confirmation.</li>
        <li>No behavioral profiling or automated scoring.</li>
        <li>You have the right to request human review of any AI interpretation.</li>
        <li>You may opt to <strong>not use Liriun Mode</strong> and continue in manual mode.</li>
      </ul>

      <h2>5. Sharing</h2>
      <ul>
        <li>Operators listed in section 2.3.</li>
        <li>
          Public authorities, only upon court order or binding legal requisition (LGPD art.
          26; Internet Bill art. 10, §1).
        </li>
      </ul>
      <p>No commercial sharing with third parties.</p>

      <h2>6. International transfer</h2>
      <p>
        Some operations involve international transfer (Google API calls, Supabase storage).
        Carried out under <strong>LGPD art. 33, II</strong> (specific contractual clauses),
        ensuring a level of protection compatible with Brazilian law.
      </p>

      <h2>7. Retention</h2>
      <ul>
        <li><strong>Active account:</strong> as long as you remain a user.</li>
        <li>
          <strong>After deletion:</strong> identifiable personal data erased within 30 days.
          Tasks, categories and relationships: immediate cascade.
        </li>
        <li><strong>Application logs:</strong> kept for 6 months (Internet Bill art. 15).</li>
      </ul>

      <h2>8. Data subject rights (LGPD art. 18)</h2>
      <ul>
        <li>Confirmation that processing exists.</li>
        <li>Access to data.</li>
        <li>Correction of incomplete, inaccurate or outdated data.</li>
        <li>Anonymization, blocking or deletion of unnecessary or non-compliant data.</li>
        <li>Data portability (JSON export available).</li>
        <li>Deletion of personal data processed under consent.</li>
        <li>Information about sharing.</li>
        <li>Consent withdrawal.</li>
      </ul>
      <p>
        To exercise any right, write to{" "}
        <a href="mailto:privacidade@liriun.com" target="_blank" rel="noopener noreferrer">privacidade@liriun.com</a>. Reply within 15
        business days.
      </p>

      <h2>9. Security</h2>
      <ul>
        <li>Passwords stored as hashes with a robust algorithm (bcrypt/argon2).</li>
        <li>HTTPS/TLS connections.</li>
        <li>Role-based restricted access to the production database.</li>
        <li>Automated backups with at-rest encryption.</li>
      </ul>

      <h2>10. Children and adolescents</h2>
      <p>
        Liriun is not intended for users under 18 and does not knowingly collect data on
        children or adolescents. If you identify improper processing, write to the DPO.
      </p>

      <h2>11. Changes</h2>
      <p>
        Material updates will be communicated at least 30 days in advance by e-mail and
        in-app.
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions, complaints or rights exercise:{" "}
        <a href="mailto:privacidade@liriun.com" target="_blank" rel="noopener noreferrer">privacidade@liriun.com</a>.
      </p>
      <p>
        You may also reach out to the{" "}
        <a href="https://www.gov.br/anpd/pt-br" target="_blank" rel="noopener noreferrer">
          Brazilian National Data Protection Authority (ANPD)
        </a>
        .
      </p>
    </>
  );
}
