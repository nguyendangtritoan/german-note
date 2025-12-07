1. API Layer (./api)

Adapter: index.js (Routes to Gemini/Groq/Mock based on .env)

Providers: gemini.js, groq.js

Mock Data: mock.js

2. Core Logic (./hooks)

useAppLogic.js: The "Brain" (Auth, Search Waterfall, Saving, Deleting).

useLocalStorage.js: Persistence helper.

3. State Management (./context)

BundleContext.jsx: Tracks activeBundleId.

SettingsContext.jsx: Tracks targetLanguages, visibility, and selectedGrammar.

4. UI Components (./components)

Main Views: Dashboard.jsx (Controller), LoginScreen.jsx, LiveFeed.jsx.

Interactive: InputHero.jsx (Search + Grammar Badge), BundleSelector.jsx (Popover Menu), WordCard.jsx.

Modals: FlashcardModal.jsx (Study), GrammarModal.jsx (Topics), SettingsModal.jsx, ConfirmationModal.jsx.

Primitives (./components/ui): Button.jsx, Icon.jsx, Modal.jsx.

5. Utilities (./utils)

promptUtils.js: Centralized Prompt Engineering (System Instructions + JSON Schema).

grammarData.js: The CEFR A1-B2 topic list.

constants.jsx: API URLs.