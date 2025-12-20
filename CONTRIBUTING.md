# Contributing to Web Whiteboard

First off, thanks for taking the time to contribute! 🎉

The following is a set of guidelines for contributing to **Web Whiteboard**. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Your First Code Contribution](#your-first-code-contribution)
  - [Understanding labels](#issue-labels)
- [Development Contribution Workflow](#development-contribution-workflow)
  - [Contributing via Pull Requests](#how-to-contribute-via-pull-requests)
  - [Development Best Practices](#development-best-practices)
- [Pull Request Checklist](#pull-request-checklist)
- [Styleguides](#styleguides)
  - [Commit Messages](#commit-messages)
  - [JavaScript Styleguide](#javascript-styleguide)

---

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report. Following these guidelines helps maintainers and the community understand your report, reproduce the behavior, and find related reports.

**Before Submitting a Bug Report:**
* **Check the [Issues](https://github.com/bhaumikmaan/web-whiteboard/issues)** to see if the problem has already been reported.
* **Disable extensions** to rule out browser interference.

**How to Submit a Good Bug Report:**
Open a new issue and include:
1.  **Use a clear and descriptive title.**
2.  **Describe the exact steps to reproduce the problem.**
3.  **Describe the behavior you observed** after following the steps.
4.  **Explain which behavior you expected to see instead.**
5.  **Include screenshots or GIFs** if the issue is visual.
6.  **Include details about your environment:** OS (Windows/Mac/Linux), Browser (Chrome/Firefox/Safari) and version.

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion, including completely new features and minor improvements to existing functionality.

**How to Submit an Enhancement Suggestion:**
1.  **Check the [Issues](https://github.com/bhaumikmaan/web-whiteboard/issues)** to see if the feature has already been requested.
2.  Open a new issue and label it `enhancement` or `feature`.
3.  **Provide a step-by-step description of the suggested enhancement** in as much detail as possible.
4.  **Explain why this enhancement would be useful** to most users.

### Your First Code Contribution

Unsure where to begin? You can start by looking through these `good-first-issue` and `help-wanted` issues:
* [Good First Issues](https://github.com/bhaumikmaan/web-whiteboard/labels/good%20first%20issue) - issues which should only require a few lines of code.

### Issue Labels
Project maintainers use labels to help organize issues. Here are some of the labels you might encounter:

- `bug` — Something isn't working correctly
- `feature` — New feature request
- `enhancement` — Improvement to existing functionality
- `documentation` — Documentation updates needed
- `good first issue` — Great for newcomers
- `help wanted` — Extra attention needed

Please use these labels when creating issues to help prioritize and categorize them effectively.

---

## Development Contribution Workflow

### How to Contribute via Pull Requests

* Fork the project.
* Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
  * Use descriptive branch names like `feature/collaboration-mode` or `fix/canvas-zoom`
* Make Your Changes 
   * Write clean, readable code
   * Follow the existing code style and conventions
   * Add comments for complex logic
   * Test your changes thoroughly
* Commit your Changes (`git commit -m 'Add some AmazingFeature'`). Use meaningful commit messages following the conventional commits format:
  * `feat:` for new features
  * `fix:` for bug fixes
  * `docs:` for documentation
  * `style:` for code style changes
  * `refactor:` for code refactoring
  * `test:` for test additions
* Push to the Branch (git push origin feature/AmazingFeature).
* Open a Pull Request targeting the `main` branch of the original repository.

### Development Best Practices

- Keep commits small and focused
- Write descriptive pull request titles and descriptions
- Ensure all tests pass before submitting
- Follow the existing code style
- Update documentation for new features
- Test on multiple browsers if possible

---

## Pull Request Checklist

When you open a Pull Request, please ensure the following:

- [ ] The code compiles correctly.
- [ ] You have run `npm run lint` and fixed any errors.
- [ ] You have added necessary comments for complex logic.
- [ ] You have updated the documentation (if relevant).
- [ ] The PR title follows the Conventional Commits format.

--- 

## Styleguides

### Commit Messages

We follow the **[Conventional Commits](https://www.conventionalcommits.org/)** specification. This leads to more readable messages that are easy to follow when looking through the project history.

**Format:** `<type>(<scope>): <subject>`

**Examples:**
* `feat: add circle drawing tool`
* `fix(canvas): resolve touch event latency on mobile`
* `docs: update README with new shortcuts`
* `style: formatting missing semi-colons`
* `refactor: simplify eraser logic`
* `test: add unit tests for shape calculator`

**Allowed Types:**
* `feat`: A new feature
* `fix`: A bug fix
* `docs`: Documentation only changes
* `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
* `refactor`: A code change that neither fixes a bug nor adds a feature
* `perf`: A code change that improves performance
* `test`: Adding missing tests or correcting existing tests
* `chore`: Changes to the build process or auxiliary tools

### JavaScript Styleguide

* We use **ESLint** and **Prettier** to enforce code style.
* Please ensure your code passes linting before submitting a PR.
* Use `const` and `let`, avoid `var`.
* Use concise and descriptive variable names.
* Prefer functional components and Hooks for React code.

---

Thank you for contributing! 🚀
