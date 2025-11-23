# Publishing the Chainlink Plugin to NPM

## Pre-requisites

1. **NPM Account**: Create an account at https://www.npmjs.com/signup
2. **NPM Login**: Run `npm login` in your terminal
3. **Package Name**: Verify the name `@hederaagentkit/chainlink-plugin` is available

## Publishing Steps

### 1. Navigate to Plugin Directory

```bash
cd server/src/plugins/chainlink-plugin
```

### 2. Verify Package Configuration

Check that `package.json` has:
- Correct name: `@hederaagentkit/chainlink-plugin`
- Version: `1.0.0` (or your desired version)
- Repository URL
- License

### 3. Build the Package

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` folder.

### 4. Test Locally (Optional)

Test the package locally before publishing:

```bash
# From plugin directory
npm pack

# This creates @hederaagentkit-chainlink-plugin-1.0.0.tgz
# Install it in another project to test:
npm install /path/to/@hederaagentkit-chainlink-plugin-1.0.0.tgz
```

### 5. Publish to NPM

```bash
# Dry run to see what will be published
npm publish --dry-run

# Publish for real (requires npm login)
npm publish --access public
```

> **Note**: The `--access public` flag is required for scoped packages like `@hederaagentkit/chainlink-plugin`

### 6. Verify Publication

Check your package at:
```
https://www.npmjs.com/package/@hederaagentkit/chainlink-plugin
```

## Installation by Users

Once published, users can install with:

```bash
npm install @hederaagentkit/chainlink-plugin
```

## Usage After Installation

```typescript
import { chainlinkPlugin, chainlinkPluginToolNames } from '@hederaagentkit/chainlink-plugin';
import { HederaLangchainToolkit } from 'hedera-agent-kit';

const toolkit = new HederaLangchainToolkit({
  client,
  configuration: {
    tools: [chainlinkPluginToolNames.GET_PRICE_FEED_TOOL],
    plugins: [chainlinkPlugin],
  },
});
```

## Updating the Package

To publish updates:

1. Update version in `package.json`:
   ```json
   "version": "1.0.1"
   ```

2. Rebuild and publish:
   ```bash
   npm run build
   npm publish
   ```

## Version Guidelines (Semantic Versioning)

- **Patch** (1.0.x): Bug fixes
- **Minor** (1.x.0): New features, backward compatible
- **Major** (x.0.0): Breaking changes

## NPM Scripts Available

```bash
npm run build          # Compile TypeScript
npm run prepublishOnly # Runs automatically before publish
```

## Files Included in Package

The following files are published (see `.npmignore`):
- `dist/` - Compiled JavaScript and type definitions
- `README.md` - Documentation
- `package.json` - Package metadata

Files excluded:
- `node_modules/`
- Source `.ts` files (only compiled `.js` and `.d.ts` are included)
- `.env` files
- Log files

## Troubleshooting

### Error: "You must be logged in to publish packages"
```bash
npm login
```

### Error: "Package name already exists"
Change the name in `package.json` to something unique:
```json
"name": "@yourorg/chainlink-plugin"
```

### Error: "You do not have permission to publish"
For scoped packages, add:
```bash
npm publish --access public
```

## Support

For issues or questions:
- GitHub Issues: https://github.com/LATAMBuilders/hedera-xchainlink-plugin/issues
- Hedera Discord: https://hedera.com/discord
