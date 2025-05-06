# Contributing to Walkup Baseball Manager

Thank you for your interest in contributing! Your help is appreciated.  
Please read the following guidelines to make the process smooth for everyone.

---

## Getting Started

1. **Fork the repository** and clone it to your local machine.
2. **Install dependencies**:
    ```bash
   npm install
   ```
3. Set up environment variables:
    Create a .env file in the project root with the following:
    VITE_SUPABASE_URL=your-supabase-url
    VITE_SUPABASE_KEY=your-supabase-key
4. Start the development server: 
    ```bash
    npm run dev
    ```
---

## Code Style
-   Use Prettier and ESLint for formatting and linting.
-   Use functional React components and hooks.
-   Use TypeScript for new files when possible.
-   Keep code readable and well-commented.

---

## Making Changes
-   Create a new branch for your feature or bugfix:
```bash
git checkout -b feature/my-feature
```
-   Make your changes and commit them with clear messages.
-   If you add or change UI, test on both desktop and mobile views.

---

## Testing
-   Please add or update tests for your changes if possible.
-   Run tests before submitting:
```bash
npm run test
```
-   If you add new dependencies, explain why in your pull request.

---

## Pull Requests
-   Push your branch and open a pull request against main.
-   Describe your changes and reference any related issues.
-   Ensure your code passes linting and type checks:
```bash
npm run lint
npm run typecheck
```
-   Be responsive to feedback and ready to make adjustments.

---

## Environment & Security
-   Never commit secrets or API keys directly to the repo.
-   Use environment variables for all sensitive data.

---

## Need Help?
If you have questions, open an issue or ask in the discussions tab.

Thank you for contributing!