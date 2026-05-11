export type LegalDocumentSlug =
  | "terms"
  | "privacy"
  | "subscriptions"
  | "community";

export type LegalSection = {
  title: string;
  body: string[];
};

export type LegalDocument = {
  slug: LegalDocumentSlug;
  title: string;
  subtitle: string;
  effectiveDate: string;
  sections: LegalSection[];
};

export const legalCompany = {
  appName: "OutGo",
  legalName: "Clyzio MB",
  companyCode: "307107260",
  address: "Polocko g. 2-2, LT-01204 Vilnius, Lithuania",
  phone: "+370 615 41336",
  supportEmail: process.env.EXPO_PUBLIC_LEGAL_EMAIL || "support@outgo.app",
  privacyEmail: process.env.EXPO_PUBLIC_PRIVACY_EMAIL || "privacy@outgo.app"
};

const effectiveDate = "May 3, 2026";

export const legalDocuments: Record<LegalDocumentSlug, LegalDocument> = {
  terms: {
    slug: "terms",
    title: "Terms and Conditions",
    subtitle: "The rules for using OutGo.",
    effectiveDate,
    sections: [
      {
        title: "1. Who operates OutGo",
        body: [
          `OutGo is operated by ${legalCompany.legalName}, company code ${legalCompany.companyCode}, registered at ${legalCompany.address}. In these Terms, "OutGo", "we", "us" and "our" refer to ${legalCompany.legalName}.`,
          `You can contact us at ${legalCompany.supportEmail}, by phone at ${legalCompany.phone}, or by post at our registered address.`
        ]
      },
      {
        title: "2. What OutGo is",
        body: [
          "OutGo helps people discover, create, join and coordinate small real-world social activities, such as coffee meetups, walks, study sessions, board games, language exchange, food, cultural activities, volunteering, no-phone meetups and other low-pressure plans.",
          "OutGo is a technology platform. We do not organize, supervise, endorse, verify, insure, transport, host or control events unless we clearly say that a specific event is officially organized by us."
        ]
      },
      {
        title: "3. Accepting these Terms",
        body: [
          "By creating an account, using the app, joining or creating an event, sending a message, buying a subscription, or otherwise using OutGo, you agree to these Terms, the Privacy Policy, the Subscription Terms and the Community and Safety Guidelines.",
          "If you do not agree with these documents, you must not use OutGo."
        ]
      },
      {
        title: "4. Eligibility",
        body: [
          "You must be at least 18 years old, or the age of legal majority in your country, to create an account, host events or join events through OutGo.",
          "By using OutGo, you confirm that you have legal capacity to accept these Terms and that your use of the app is lawful in the country where you use it."
        ]
      },
      {
        title: "5. Account registration and security",
        body: [
          "You must provide accurate account and profile information and keep it up to date. You may not impersonate another person, create accounts for others without permission, or use misleading profile information.",
          "You are responsible for protecting your account credentials and for activity under your account. Tell us promptly if you believe your account has been accessed without permission."
        ]
      },
      {
        title: "6. Profiles, events and user content",
        body: [
          "You are responsible for the content you submit, including profile information, event descriptions, locations, messages, reports and photos. You must have the rights and permissions needed to share that content.",
          "You give us a worldwide, non-exclusive, royalty-free license to host, store, display, reproduce, adapt and use your content only as needed to operate, improve, protect and promote OutGo.",
          "You may not post content that is illegal, misleading, abusive, discriminatory, sexually exploitative, violent, harassing, spammy, infringing, unsafe or otherwise inconsistent with OutGo's purpose."
        ]
      },
      {
        title: "7. Event hosting responsibilities",
        body: [
          "Hosts must describe events honestly, choose public and reasonably safe meeting places, set realistic group sizes, respect participant boundaries, and communicate important changes or cancellations.",
          "Hosts must not charge hidden fees, run illegal activities, pressure participants, collect unnecessary personal data, or present themselves as official OutGo representatives unless we have authorized them in writing."
        ]
      },
      {
        title: "8. Participant responsibilities",
        body: [
          "Participants are responsible for deciding whether an event, host, place and group are suitable for them. Use common sense, meet in public places, tell someone where you are going, arrange your own transport, and leave if something feels wrong.",
          "Joining an event does not guarantee that the event will happen, that a host or participant will attend, or that the experience will meet your expectations."
        ]
      },
      {
        title: "9. Safety disclaimer",
        body: [
          "OutGo does not perform background checks, identity verification, venue inspections or real-time event supervision. User profiles, host notes, reports and safety reminders are not guarantees of safety.",
          "OutGo is not an emergency service. If you are in danger or need urgent help, contact local emergency services immediately."
        ]
      },
      {
        title: "10. Chat and messages",
        body: [
          "Event chat is intended for event logistics and respectful coordination. You may access event chat only when you are the host or a participant, subject to the app's technical and policy rules.",
          "We may review messages when needed to investigate reports, enforce these Terms, comply with law, protect users or maintain the service."
        ]
      },
      {
        title: "11. Subscriptions and payments",
        body: [
          "OutGo may offer paid subscriptions, including OutGo Plus. Subscription purchases made in the iOS app are processed by Apple App Store, and purchases made in the Android app are processed by Google Play. RevenueCat helps us manage subscription status.",
          "Subscription details, pricing, renewal, cancellation and refunds are described in the Subscription Terms and in the store checkout flow. The store checkout flow controls the final price, taxes, billing period and payment confirmation."
        ]
      },
      {
        title: "12. Moderation and enforcement",
        body: [
          "We may remove content, limit visibility, cancel events, restrict chat, suspend accounts, terminate accounts, or take other reasonable action if we believe these Terms or our safety rules have been violated.",
          "We may also act to protect users, comply with law, prevent abuse, investigate reports, protect the app, or reduce legal, operational or security risk."
        ]
      },
      {
        title: "13. Reports",
        body: [
          "Users can report events or users for safety issues, spam, harassment, misleading information or other concerns. Reports should be made in good faith and should not be used to harass others.",
          "A report does not guarantee a specific outcome, but we will use reports to assess safety, abuse and moderation issues."
        ]
      },
      {
        title: "14. Prohibited conduct",
        body: [
          "You must not use OutGo to harass, threaten, stalk, exploit, discriminate, scam, spam, impersonate, collect data without permission, promote illegal activity, sell prohibited goods or services, or organize unsafe or deceptive events.",
          "You must not interfere with the app, reverse engineer it where prohibited by law, attempt unauthorized access, bypass safety systems, scrape data, or misuse Supabase, RevenueCat, map providers, Sentry or other service integrations."
        ]
      },
      {
        title: "15. Third-party services",
        body: [
          "OutGo uses third-party services such as Supabase, RevenueCat, Apple App Store, Google Play, Sentry and map/location providers. These services may have their own terms and privacy practices.",
          "We are not responsible for third-party services that we do not control, but we choose providers intended to support the secure and reliable operation of the app."
        ]
      },
      {
        title: "16. Intellectual property",
        body: [
          "OutGo, the OutGo name, app structure, software, branding, text, interfaces and related materials are owned by us or our licensors and are protected by applicable intellectual property laws.",
          "You may not copy, modify, distribute, sell or exploit any part of OutGo except as permitted by these Terms or applicable law."
        ]
      },
      {
        title: "17. Service changes and availability",
        body: [
          "We may change, suspend, limit or discontinue parts of OutGo at any time. We will try to avoid unnecessary disruption, but we do not guarantee that the app will always be available, uninterrupted, secure or error-free.",
          "Some features may depend on network access, app stores, third-party providers, device settings, location permissions and account status."
        ]
      },
      {
        title: "18. Disclaimers",
        body: [
          "OutGo is provided on an 'as is' and 'as available' basis. To the fullest extent allowed by law, we disclaim warranties of merchantability, fitness for a particular purpose, non-infringement, accuracy, availability and safety.",
          "Nothing in these Terms limits rights that cannot be limited under applicable consumer protection law."
        ]
      },
      {
        title: "19. Liability",
        body: [
          "To the fullest extent allowed by law, we are not liable for indirect, incidental, special, consequential, punitive or exemplary damages, loss of profits, loss of data, personal interactions, event outcomes, user conduct, venue conditions or third-party actions.",
          "Where liability cannot be excluded, our liability will be limited to the amount you paid to us for OutGo during the twelve months before the claim, unless applicable law requires a higher amount."
        ]
      },
      {
        title: "20. Indemnity",
        body: [
          "If allowed by applicable law, you agree to defend and indemnify us from claims, losses, liabilities, damages, costs and expenses arising from your content, your events, your conduct, your breach of these Terms, or your violation of law or third-party rights."
        ]
      },
      {
        title: "21. Termination",
        body: [
          "You may stop using OutGo at any time. We may suspend or terminate your account if we believe you violated these Terms, created risk, used the app unlawfully, or if we discontinue the service.",
          "Sections that by their nature should survive termination will survive, including safety disclaimers, liability limits, intellectual property, payment obligations and dispute provisions."
        ]
      },
      {
        title: "22. Governing law and disputes",
        body: [
          "These Terms are governed by the laws of the Republic of Lithuania, except where mandatory consumer protection laws in your country provide otherwise.",
          "Before starting formal proceedings, please contact us so we can try to resolve the issue. Courts or consumer dispute bodies with jurisdiction under applicable law may handle unresolved disputes."
        ]
      },
      {
        title: "23. Changes to these Terms",
        body: [
          "We may update these Terms from time to time. If changes are material, we will take reasonable steps to notify users through the app or another appropriate channel. Continued use after changes means you accept the updated Terms."
        ]
      },
      {
        title: "24. Contact",
        body: [
          `Questions about these Terms can be sent to ${legalCompany.supportEmail}, ${legalCompany.phone}, or ${legalCompany.address}.`
        ]
      }
    ]
  },
  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    subtitle: "How OutGo handles personal data.",
    effectiveDate,
    sections: [
      {
        title: "1. Controller",
        body: [
          `${legalCompany.legalName}, company code ${legalCompany.companyCode}, ${legalCompany.address}, is the controller of personal data processed for OutGo unless this Policy says otherwise.`,
          `Privacy requests can be sent to ${legalCompany.privacyEmail}. You can also contact us by phone at ${legalCompany.phone} or by post at our registered address.`
        ]
      },
      {
        title: "2. Scope",
        body: [
          "This Privacy Policy applies to the OutGo mobile app, related web pages, account features, event discovery, event creation, event chat, reporting, subscriptions, support and safety operations.",
          "It does not apply to websites, stores, payment processors, map providers or other third-party services that have their own privacy policies."
        ]
      },
      {
        title: "3. Data we collect",
        body: [
          "Account data: email address, authentication identifiers, login status and account metadata.",
          "Profile data: full name, username, avatar, bio, city, age range, interests, hobbies, life context, social goals and profile timestamps.",
          "Event data: event title, description, category, vibe, location name, coordinates, city, start and end time, price type, maximum participants, safety note, host ID, participant status, favorites and event timestamps.",
          "Chat and report data: event messages, report type, reason, details, reported event or user, reporter ID, moderation status and timestamps.",
          "Location data: approximate or precise device location only if you grant permission, plus event location coordinates submitted by users. Event locations for published events may be visible to other users.",
          "Media data: avatar images and metadata when you upload a profile photo.",
          "Purchase data: RevenueCat customer identifiers, subscription status, product identifiers, entitlement status, store transaction metadata and related purchase information. We do not receive full payment card numbers from Apple or Google.",
          "Notification data: device push tokens, notification preferences, delivery status, and notification interaction data needed to send plan, chat, safety and account updates if you enable notifications.",
          "Technical data: device information, app version, diagnostics, crash logs, IP address, security logs, usage events and analytics events needed to operate and improve the app."
        ]
      },
      {
        title: "4. How we collect data",
        body: [
          "We collect data directly from you when you register, edit your profile, create or join events, send messages, submit reports, upload avatars, buy subscriptions or contact us.",
          "We collect some data automatically from your device and app usage, such as diagnostics and session information.",
          "We receive some data from service providers, including Supabase for authentication and database services, RevenueCat for subscriptions, Apple or Google for store purchase flows, Sentry for error reporting and map/location providers for map features."
        ]
      },
      {
        title: "5. Purposes and legal bases",
        body: [
          "Contract: to create accounts, authenticate users, show events, enable joining/leaving events, provide event chat, manage favorites, process subscriptions and provide support.",
          "Legitimate interests: to maintain safety, prevent abuse, debug issues, improve product quality, measure feature usage, protect rights, investigate reports and secure the service.",
          "Consent: to access device location, upload photos, send optional notifications if enabled, and process optional information you choose to provide where consent is required.",
          "Legal obligation: to comply with tax, accounting, consumer protection, app store, law enforcement and regulatory obligations."
        ]
      },
      {
        title: "6. How we use data",
        body: [
          "We use personal data to operate OutGo, personalize event discovery, display profiles and events, enable chat, manage subscriptions, provide safety features, investigate reports, prevent abuse, respond to requests, fix bugs and comply with law.",
          "We do not sell personal data. We do not use OutGo to build addictive social feeds, follower graphs or advertising profiles."
        ]
      },
      {
        title: "7. Public and shared information",
        body: [
          "Published event information, including event title, description, city, location name, coordinates, time, category, vibe, host information, participant counts and safety notes, may be visible to other users.",
          "Profile information may be visible to other users, especially when you host, join, message or report events.",
          "Event chat is intended to be visible only to the host and participants of the relevant event, subject to our moderation and legal obligations."
        ]
      },
      {
        title: "8. Service providers and recipients",
        body: [
          "We may share data with service providers that help operate OutGo, including Supabase for backend, authentication, storage, realtime and Edge Function features; Expo Push Service, Apple Push Notification service and Firebase Cloud Messaging for notifications; RevenueCat for subscription management; Apple App Store and Google Play for purchases; Sentry for crash/error tracking; map and location providers for map display and location features; hosting, email, analytics, security and support providers.",
          "We may also disclose data if required by law, to protect users, to investigate abuse, to enforce our Terms, in connection with a business transfer, or with your instruction or consent."
        ]
      },
      {
        title: "9. International transfers",
        body: [
          "Our service providers may process data in countries outside Lithuania and the European Economic Area. When required, we rely on appropriate safeguards such as adequacy decisions, standard contractual clauses, provider data processing terms or other lawful transfer mechanisms."
        ]
      },
      {
        title: "10. Retention",
        body: [
          "We keep personal data only for as long as needed for the purposes described in this Policy, including account operation, safety, legal, tax, accounting, dispute, fraud prevention and backup purposes.",
          "Account and profile data is generally kept while your account exists. Event, message and report data may be kept after account deletion if needed for safety, dispute resolution, legal compliance or protection of other users.",
          "Backups and logs may persist for a limited period before deletion or overwriting."
        ]
      },
      {
        title: "11. Your rights",
        body: [
          "Depending on your location, you may have rights to access, correct, delete, restrict, object to processing, receive a copy of your data, withdraw consent and lodge a complaint with a supervisory authority.",
          `To exercise these rights, contact ${legalCompany.privacyEmail}. We may need to verify your identity before acting on a request.`,
          "If you are in the European Union, you may also contact your local data protection authority. In Lithuania, the supervisory authority is the State Data Protection Inspectorate."
        ]
      },
      {
        title: "12. Account deletion",
        body: [
          "You may request account deletion by contacting us. We will delete or anonymize personal data unless we need to keep it for legal, safety, fraud prevention, accounting, dispute or legitimate operational reasons.",
          "Deleting your OutGo account does not automatically cancel App Store or Google Play subscriptions. You must cancel subscriptions through the relevant store account settings."
        ]
      },
      {
        title: "13. Security",
        body: [
          "We use technical and organizational measures intended to protect personal data, including managed authentication, row-level access controls, storage rules, restricted service credentials and monitoring.",
          "No system is perfectly secure. You are responsible for protecting your login credentials and using caution when meeting people offline."
        ]
      },
      {
        title: "14. Children",
        body: [
          "OutGo is intended for adults. We do not knowingly allow children under 18 to create accounts, host or join events. If you believe a child has provided personal data to us, contact us so we can take appropriate action."
        ]
      },
      {
        title: "15. Automated decision-making",
        body: [
          "We do not use automated decision-making that produces legal or similarly significant effects. We may use automated rules to support security, spam prevention, abuse detection and safety moderation."
        ]
      },
      {
        title: "16. App Store privacy information",
        body: [
          "Apple requires developers to disclose app privacy practices in App Store Connect. Our disclosures should reflect all data collected by OutGo and third-party SDKs, including account, profile, event, chat, report, location, purchase and diagnostics data where applicable.",
          "If our data practices change, we will update this Policy and the relevant app store privacy disclosures."
        ]
      },
      {
        title: "17. Changes to this Policy",
        body: [
          "We may update this Privacy Policy from time to time. If changes are material, we will take reasonable steps to notify users through the app or another appropriate channel."
        ]
      },
      {
        title: "18. Contact",
        body: [
          `Privacy questions or requests can be sent to ${legalCompany.privacyEmail}, ${legalCompany.phone}, or ${legalCompany.address}.`
        ]
      }
    ]
  },
  subscriptions: {
    slug: "subscriptions",
    title: "Subscription Terms",
    subtitle: "OutGo Plus pricing, renewal and cancellation.",
    effectiveDate,
    sections: [
      {
        title: "1. OutGo Plus",
        body: [
          "OutGo Plus is an optional paid subscription that supports OutGo and may unlock premium member features, priority discovery or hosting tools, and other subscriber benefits as they are released.",
          "The core OutGo app may continue to include free features. We may change which features are free or paid, subject to applicable law and app store rules."
        ]
      },
      {
        title: "2. Plans and target prices",
        body: [
          "The intended OutGo Plus prices are EUR 3 per month for the monthly plan and EUR 24 per year for the yearly plan.",
          "The final price, currency, taxes, billing period and confirmation are shown in the App Store or Google Play checkout screen before purchase. The store checkout screen controls if it differs from text shown in OutGo."
        ]
      },
      {
        title: "3. Auto-renewal",
        body: [
          "OutGo Plus subscriptions automatically renew at the end of each billing period unless cancelled before renewal through the relevant app store account settings.",
          "Your store account will be charged according to the store's rules. We do not control Apple's or Google's billing timing, authentication prompts or payment method handling."
        ]
      },
      {
        title: "4. Cancellation",
        body: [
          "You can cancel through your Apple App Store or Google Play subscription settings. Deleting the OutGo app or deleting your OutGo account does not automatically cancel your subscription.",
          "After cancellation, you generally keep access until the end of the already paid billing period unless the store states otherwise."
        ]
      },
      {
        title: "5. Refunds",
        body: [
          "Refund requests for App Store purchases are handled by Apple. Refund requests for Google Play purchases are handled by Google, unless applicable store rules or law require another process.",
          "We cannot guarantee refunds because stores control payment processing and refund approval for in-app purchases."
        ]
      },
      {
        title: "6. Trials and promotions",
        body: [
          "If we offer a free trial, introductory price or promotional offer, the terms shown in the app store checkout apply. Unless cancelled before the trial ends, a trial may convert into a paid auto-renewing subscription."
        ]
      },
      {
        title: "7. Entitlement and account matching",
        body: [
          "RevenueCat helps us determine whether your OutGo account has an active subscription entitlement. We use your OutGo user ID as the RevenueCat app user ID when you are logged in.",
          "If you use multiple app store accounts, devices or OutGo accounts, subscription access may depend on store rules, RevenueCat syncing and restore-purchase behavior."
        ]
      },
      {
        title: "8. Price or plan changes",
        body: [
          "We may change subscription prices or plan features in the future. Store rules determine whether you receive advance notice, whether consent is required, and when changes take effect.",
          "If you do not accept a required price change, your subscription may end at the end of the current billing period."
        ]
      },
      {
        title: "9. Availability",
        body: [
          "Subscription availability can vary by country, platform, app store, account eligibility and technical status. We may add, change or remove subscription benefits as the product evolves, while continuing to provide ongoing value for paid subscribers."
        ]
      },
      {
        title: "10. Contact",
        body: [
          `Questions about OutGo Plus can be sent to ${legalCompany.supportEmail}. For store billing, you may also need to contact Apple or Google through your store account.`
        ]
      }
    ]
  },
  community: {
    slug: "community",
    title: "Community and Safety Guidelines",
    subtitle: "How to keep OutGo low-pressure and real-life friendly.",
    effectiveDate,
    sections: [
      {
        title: "1. Meet in public",
        body: [
          "Choose public, easy-to-find places for first meetups. Avoid private homes, isolated locations or unclear meeting points for first-time events.",
          "Hosts should include a practical safety note and a clear visible meeting point."
        ]
      },
      {
        title: "2. Keep it low-pressure",
        body: [
          "OutGo is for calm real-world plans, not social performance. Respect quiet people, late arrivals, early departures, different comfort levels and no-phone preferences.",
          "Do not pressure anyone to drink, spend money, share contact details, stay longer, take photos, move locations or disclose personal information."
        ]
      },
      {
        title: "3. Respect boundaries",
        body: [
          "Harassment, threats, stalking, hate, sexual pressure, unwanted contact, intimidation, doxxing, bullying and discriminatory behavior are not allowed.",
          "If someone says no, leaves, stops replying or asks for space, respect it immediately."
        ]
      },
      {
        title: "4. Host responsibly",
        body: [
          "Hosts should be honest about the activity, cost, location, group size, accessibility, expected vibe and any important rules.",
          "Cancel or update an event if plans change. Do not use OutGo events to mislead people into sales pitches, recruitment schemes, unsafe situations or unrelated promotions."
        ]
      },
      {
        title: "5. Join responsibly",
        body: [
          "Join only when you reasonably intend to attend. Leave the event in the app if you can no longer come so spots remain available for others.",
          "Arrange your own transport, keep personal belongings safe, and make your own judgment about whether to stay at an event."
        ]
      },
      {
        title: "6. No illegal or dangerous activity",
        body: [
          "Do not create or join events involving illegal goods, violence, weapons, exploitation, unsafe stunts, fraud, scams, evasion of laws, or activities that require licenses or professional supervision unless all legal requirements are met."
        ]
      },
      {
        title: "7. Photos and privacy",
        body: [
          "Ask before photographing, filming, tagging or posting other participants. No-phone meetups should be respected unless the group clearly agrees otherwise.",
          "Do not share private chat content, personal information or another person's location without permission."
        ]
      },
      {
        title: "8. Reporting",
        body: [
          "Use the report tools for safety concerns, harassment, spam, misleading events, fake profiles or other behavior that conflicts with these Guidelines.",
          "If there is immediate danger, contact local emergency services first. OutGo reports are not monitored as an emergency channel."
        ]
      },
      {
        title: "9. Moderation",
        body: [
          "We may remove events, limit features, restrict accounts, or take other action when we believe these Guidelines or the Terms have been violated.",
          "Moderation decisions are based on available information and may not always be visible to all users."
        ]
      }
    ]
  }
};

export const legalDocumentList = [
  legalDocuments.terms,
  legalDocuments.privacy,
  legalDocuments.subscriptions,
  legalDocuments.community
];
