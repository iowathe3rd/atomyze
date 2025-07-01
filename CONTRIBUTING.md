# Contributing to Particle Weaver

First off, thank you for considering contributing to Particle Weaver! 🎉

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed and what behavior you expected**
- **Include screenshots if possible**

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and explain which behavior you expected**

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. If you've changed APIs, update the documentation
4. Ensure the test suite passes
5. Make sure your code lints
6. Issue that pull request!

## Development Process

### Setting up the development environment

```bash
git clone https://github.com/iowathe3rd/particle-weaver.git
cd particle-weaver
npm install
```

### Development workflow

1. **Start development server**: `npm run dev`
2. **Run tests**: `npm test`
3. **Build library**: `npm run build`
4. **Lint code**: `npm run lint`
5. **Type check**: `npm run type-check`

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

- `feat: add new particle shape type`
- `fix: resolve connection color not updating`
- `docs: update README with new examples`
- `style: format code with prettier`
- `refactor: simplify particle system initialization`
- `test: add tests for model generator`
- `chore: update dependencies`

### Code Style

- Use TypeScript for all new code
- Follow the existing code style (we use Prettier and ESLint)
- Write clear, self-documenting code
- Add JSDoc comments for public APIs
- Keep functions small and focused

### Testing

- Write unit tests for new functionality
- Update existing tests when modifying code
- Ensure all tests pass before submitting PR
- Aim for good test coverage

## Project Structure

```
src/
├── core/           # Core classes (ParticleWeaver, ParticleSystem)
├── generators/     # Shape and model generators
├── types/          # TypeScript type definitions
└── index.ts        # Main entry point
```

## Release Process

Releases are automated through GitHub Actions:

1. Create PR with your changes
2. Once merged to `main`, the version is automatically bumped
3. A new release is created and published to npm
4. Documentation is automatically updated

## Questions?

Feel free to open an issue with the `question` label or reach out to the maintainers.

Thank you for contributing! 🚀
