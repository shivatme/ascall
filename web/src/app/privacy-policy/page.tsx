export default function PrivacyPolicy() {
  return (
    <main className="p-6 max-w-3xl mx-auto text-gray-100">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <p className="mb-4">
        This Privacy Policy outlines how we handle your personal information in
        the SYNQ mobile application. By using SYNQ, you agree to the practices
        described below.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">
        1. Information We Collect
      </h2>
      <p className="mb-4">
        To provide core functionality, SYNQ requires users to sign in using
        their phone number. Optionally, users may provide their name and email.
        A profile photo is also stored if provided by the user.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">
        2. Sign-In and Authentication
      </h2>
      <p className="mb-4">
        Sign-in is mandatory to use the app. We use Firebase Authentication to
        securely manage sign-ins with phone numbers.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">3. Use of Firebase</h2>
      <p className="mb-4">
        SYNQ uses Firebase as a backend platform. Firebase may process user data
        (such as phone numbers) strictly for authentication purposes and storage
        of profile information. No sensitive or unnecessary data is collected or
        stored.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">4. Data Storage</h2>
      <p className="mb-4">
        We do not store any video or audio from your calls. Only your profile
        photo, if uploaded, is stored securely in Firebase Storage.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">5. Data Sharing</h2>
      <p className="mb-4">
        We do not share your personal information with any third parties. Your
        data is used strictly for the purpose of providing core features within
        the app.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">6. Analytics</h2>
      <p className="mb-4">
        SYNQ does not collect or use analytics or tracking data at this time.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">
        7. Your Privacy Rights
      </h2>
      <p className="mb-4">
        You may contact us at any time to request deletion of your profile or
        personal information stored within the app.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">8. Contact Us</h2>
      <p className="mb-4">
        If you have any questions or concerns about this Privacy Policy, feel
        free to reach out at:
        <a
          href="mailto:shivamt0516@gmail.com"
          className="text-blue-400 hover:underline"
        >
          shivamt0516@gmail.com
        </a>
      </p>

      <p className="text-sm text-gray-400 mt-8">
        Last updated:{" "}
        {new Date().toLocaleDateString("en-IN", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </p>
    </main>
  );
}
