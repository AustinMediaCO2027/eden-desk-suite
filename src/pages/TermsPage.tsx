import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import edenDarkLogo from "@/assets/eden_dark_logo.png";

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/30 py-4">
        <div className="container mx-auto px-6 flex items-center justify-between">
          <Link to="/">
            <img src={edenDarkLogo} alt="Eden Desk" className="h-8" />
          </Link>
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12 max-w-3xl prose prose-neutral dark:prose-invert prose-headings:font-bold prose-h1:text-3xl prose-h2:text-xl prose-h3:text-lg">
        <h1>EDEN DESK — TERMS, PRIVACY POLICY &amp; DISCLAIMER</h1>
        <p><strong>Last Updated:</strong> March 2026</p>
        <p>Welcome to <strong>Eden Desk</strong> ("Eden Desk", "we", "our", or "platform").</p>
        <p>By accessing or using https://eden-desk.com, you agree to the following Terms, Privacy Policy, and Disclaimer. If you do not agree, please discontinue use of the platform.</p>

        <hr />

        <h2>1. ABOUT EDEN DESK</h2>
        <p>Eden Desk is a cloud-based Software-as-a-Service (SaaS) platform that enables businesses, professionals, and creators to manage documents, tasks, and digital workflows through an online dashboard.</p>
        <p>Eden Desk provides productivity software only and does not participate in users' business operations or transactions.</p>

        <h2>2. USER ACCOUNTS</h2>
        <p>By creating an account, you agree that:</p>
        <ul>
          <li>All information provided is accurate and current.</li>
          <li>You are responsible for safeguarding your login credentials.</li>
          <li>All activity under your account is your responsibility.</li>
          <li>You are legally authorised to operate a business or use professional tools.</li>
        </ul>
        <p>Eden Desk reserves the right to suspend accounts that violate these terms.</p>

        <h2>3. SUBSCRIPTIONS &amp; BILLING</h2>
        <p>Eden Desk operates on a subscription model.</p>
        <ul>
          <li>Subscription access depends on the selected plan.</li>
          <li>Payments renew automatically unless cancelled.</li>
          <li>Non-payment may result in restricted access or suspension.</li>
          <li>Pricing may change with reasonable notice.</li>
        </ul>

        <h2>4. FREE PLAN POLICY</h2>
        <p>The Standard plan is available at no subscription cost and is supported by advertising.</p>
        <ul>
          <li>Free-plan access is subject to the published usage limits.</li>
          <li>Abuse of free-plan access may result in account restriction.</li>
          <li>Paid features require an active Silver or Premium subscription.</li>
        </ul>

        <h2>5. PLATFORM USAGE</h2>
        <p>Users agree NOT to:</p>
        <ul>
          <li>Use the platform for unlawful activities.</li>
          <li>Upload malicious or harmful content.</li>
          <li>Attempt to exploit, copy, reverse engineer, or interfere with Eden Desk systems.</li>
          <li>Violate intellectual property or privacy rights.</li>
        </ul>

        <h2>6. USER CONTENT &amp; OWNERSHIP</h2>
        <p>All files, invoices, logos, documents, and data uploaded remain the property of the user.</p>
        <p>Eden Desk does not claim ownership of user content.</p>
        <p>Users are solely responsible for:</p>
        <ul>
          <li>document accuracy,</li>
          <li>financial transactions,</li>
          <li>legal compliance,</li>
          <li>communications conducted using the platform.</li>
        </ul>

        <h2>7. THIRD-PARTY LOGOS &amp; SERVICES</h2>
        <p>Logos, brand names, or trademarks appearing within documents are uploaded by users for their own business purposes.</p>
        <p>These trademarks belong to their respective owners.</p>
        <p><strong>Eden Desk is not affiliated with, endorsed by, or responsible for any third-party brands used by clients on the platform.</strong></p>

        <h2>8. EMAIL &amp; COMMUNICATION FEATURES</h2>
        <p>Email sending and communication tools are provided as platform utilities.</p>
        <p>Eden Desk is not responsible for:</p>
        <ul>
          <li>email delivery failures,</li>
          <li>spam filtering,</li>
          <li>incorrect recipient details,</li>
          <li>third-party email provider interruptions.</li>
        </ul>

        <h2>9. DATA COLLECTION (PRIVACY POLICY)</h2>
        <p>We may collect:</p>
        <h3>Account Information</h3>
        <ul>
          <li>Name</li>
          <li>Email address</li>
          <li>Business information</li>
          <li>Login data</li>
        </ul>
        <h3>Usage Information</h3>
        <ul>
          <li>Dashboard activity</li>
          <li>Feature usage</li>
          <li>Device/browser data</li>
        </ul>
        <h3>Payment Information</h3>
        <p>Payments are processed via secure third-party providers such as PayFast.</p>
        <p>Eden Desk does not store complete banking or card details.</p>

        <h2>10. HOW INFORMATION IS USED</h2>
        <p>Your information is used to:</p>
        <ul>
          <li>operate and maintain the platform,</li>
          <li>manage subscriptions,</li>
          <li>provide customer support,</li>
          <li>improve system performance,</li>
          <li>send important service notifications.</li>
        </ul>
        <p>Eden Desk does <strong>not sell personal information</strong>.</p>

        <h2>11. COOKIES &amp; TRACKING</h2>
        <p>The platform may use cookies or similar technologies to:</p>
        <ul>
          <li>maintain login sessions,</li>
          <li>improve user experience,</li>
          <li>analyse platform performance.</li>
        </ul>
        <p>Users may disable cookies via browser settings.</p>

        <h2>12. DATA STORAGE &amp; SECURITY</h2>
        <p>User data is stored on secure cloud infrastructure.</p>
        <p>While reasonable safeguards are implemented, Eden Desk cannot guarantee absolute security or uninterrupted service availability.</p>
        <p>Users are encouraged to maintain backups of important documents.</p>

        <h2>13. DATA SHARING</h2>
        <p>User information is not sold or rented.</p>
        <p>Data may be shared only:</p>
        <ul>
          <li>when required by law,</li>
          <li>to protect platform security,</li>
          <li>with trusted service providers required to operate Eden Desk.</li>
        </ul>

        <h2>14. LIMITATION OF LIABILITY (DISCLAIMER)</h2>
        <p>To the fullest extent permitted by law:</p>
        <p><strong>Eden Desk, its owners, developers, affiliates, and partners shall not be liable for any direct or indirect damages arising from:</strong></p>
        <ul>
          <li>use or inability to use the platform,</li>
          <li>business losses,</li>
          <li>financial damages,</li>
          <li>incorrect invoices or documents,</li>
          <li>disputes between users and their clients,</li>
          <li>data loss,</li>
          <li>payment issues,</li>
          <li>platform interruptions,</li>
          <li>third-party service failures.</li>
        </ul>
        <p>Use of Eden Desk is entirely at the user's own risk.</p>

        <h2>15. NO PROFESSIONAL ADVICE</h2>
        <p>Eden Desk provides software tools only.</p>
        <p>We do not provide:</p>
        <ul>
          <li>legal advice,</li>
          <li>accounting advice,</li>
          <li>tax consultation,</li>
          <li>financial or business guarantees.</li>
        </ul>
        <p>Users should seek professional advisors where necessary.</p>

        <h2>16. PLATFORM AVAILABILITY</h2>
        <p>We aim to provide reliable service; however, Eden Desk does not guarantee uninterrupted or error-free operation.</p>
        <p>Temporary downtime, maintenance, or technical issues may occur.</p>

        <h2>17. TERMINATION</h2>
        <p>Eden Desk reserves the right to suspend or terminate accounts that:</p>
        <ul>
          <li>violate these terms,</li>
          <li>abuse services,</li>
          <li>engage in fraudulent or harmful behaviour.</li>
        </ul>
        <p>Users may cancel subscriptions at any time through their dashboard.</p>

        <h2>18. MODIFICATIONS</h2>
        <p>These Terms, Privacy Policy, and Disclaimer may be updated periodically.</p>
        <p>Continued use of Eden Desk after updates constitutes acceptance of revised terms.</p>

        <h2>19. GOVERNING LAW</h2>
        <p>These terms shall be governed in accordance with applicable laws of South Africa unless otherwise required by international regulations.</p>

        <h2>20. CONTACT</h2>
        <p>For enquiries regarding these terms:</p>
        <p><strong>Eden Desk</strong><br />Website: <a href="https://eden-desk.com" className="text-foreground underline">https://eden-desk.com</a></p>

        <hr />

        <p><strong>By accessing or using Eden Desk, you confirm that you have read, understood, and agreed to these Terms, Privacy Policy, and Disclaimer.</strong></p>
      </main>

      <footer className="border-t border-border/30 py-8">
        <div className="container mx-auto px-6 text-center">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Eden Desk. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default TermsPage;
