export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="font-display text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
        
        <div className="space-y-6 text-foreground">
          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed">
              We collect information you provide directly, such as your name and email when you create an account or submit reviews. 
              We also collect location data (latitude/longitude) when you search for pubs, and automatically collect device information 
              like IP address and browser type.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">2. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use your information to provide and improve our service, display weather and sunshine data for locations you search, 
              store your favorite pub gardens, process your reviews, and communicate with you about your account.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">3. Data Storage and Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your data is stored securely on our servers. We use encryption and standard security practices to protect your personal information 
              from unauthorized access, alteration, or destruction.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">4. Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use third-party services for weather data (Open-Meteo), maps (OpenStreetMap), and photo uploads. 
              These services have their own privacy policies and may collect data as part of their operations.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">5. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You can request access to, correction of, or deletion of your personal data. Contact us at privacy@suntracker.local 
              to exercise these rights.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">6. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this privacy policy from time to time. We'll notify you of significant changes via email or prominent notice on the app.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-3">7. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this privacy policy, please contact us at privacy@suntracker.local
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border/40">
          <p className="text-xs text-muted-foreground">
            Last updated: April 2026
          </p>
        </div>
      </div>
    </div>
  );
}