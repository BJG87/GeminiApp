# Publishing Your Apps Script Library

This guide will help you publish the GeminiApp library so you can use it across multiple Apps Script projects.

## Step 1: Prepare Your Project

1. Open your Apps Script project containing the library code
2. Make sure both files are in your project:
   - `GeminiApp.js`
   - `GoogleAICacheManager.js`

## Step 2: Set Up Project Settings

1. Click on **Project Settings** (gear icon) in the left sidebar
2. Under **General settings**, check:
   - ✅ Show "appsscript.json" manifest file in editor
   - Project name should be something like "GeminiApp"

## Step 3: Configure the Library

1. In the left sidebar, find **Library** (or **Libraries**)
2. You'll see a section for "Your project's library settings"
3. Click **Deploy as Library** or **Use this project as a library**

### Important Settings:

- **Description**: "A comprehensive library for Google Gemini AI integration with simple methods for text, image, and file processing"
- **Version**: Start with version 1 for your first deployment
- **Access**: Set to "Anyone" to make it publicly available

## Step 4: Get Your Script ID

After setting up as a library:

1. You'll see a **Script ID** in the library settings
2. Copy this ID - users will need it to add your library
3. The Script ID looks like: `1234567890abcdefghijklmnopqrstuvwxyz`

## Step 5: Create a Version

1. Click **Deploy** > **New deployment**
2. Select type: **Library**
3. Add a description: "Initial release with text, image, and file processing methods"
4. Click **Deploy**
5. Copy the **Deployment ID** shown

## Step 6: Test the Library

Create a test project to verify it works:

```javascript
// In a NEW Apps Script project
function testLibrary() {
  // The library should appear in your autocomplete as "GeminiApp"
  const apiKey = "your-test-key";
  const genAI = GeminiApp.newInstance(apiKey);

  const response = genAI.prompt("Hello, world!");
  Logger.log(response);
}
```

## Step 7: Share the Library

To allow others to use your library:

1. Share the **Script ID** (not the Deployment ID)
2. Provide the installation instructions:

```
Libraries > + (Add a library)
Script ID: [YOUR_SCRIPT_ID]
Identifier: GeminiApp
Version: Latest
```

## Step 8: Document Your Library

Share these documents with users:

- `PUBLISHING_README.md` - Main documentation
- `LIBRARY_USAGE.md` - Detailed usage guide
- `samples/simple-library-usage/Code.js` - Example code

## Updating the Library

When you make changes:

1. Test your changes thoroughly
2. Click **Deploy** > **Manage deployments**
3. Click **Edit** (pencil icon) on your library deployment
4. Select **New version**
5. Add a description of what changed
6. Click **Deploy**

Users will need to update to the new version in their projects.

## Best Practices

### Versioning

- **Version 1**: Initial release
- **Version 2**: Bug fixes and minor improvements
- **Version 3**: New features added
- **Version 4+**: Major updates

### Change Notes Example:

```
Version 1: Initial release
Version 2: Added promptWithFile() method, improved error handling
Version 3: Added context caching support
Version 4: Performance improvements and bug fixes
```

### Breaking Changes

If you make breaking changes (changes that will break existing code):

- Clearly document the changes
- Provide migration instructions
- Consider keeping backward compatibility when possible

## Publishing to GitHub (Optional but Recommended)

1. Create a new repository on GitHub
2. Add your code files
3. Include README and documentation
4. Add installation instructions with your Script ID

### Repository Structure:

```
GeminiApp/
├── README.md (use PUBLISHING_README.md)
├── LIBRARY_USAGE.md
├── LICENSE
├── src/
│   ├── GeminiApp.js
│   └── GoogleAICacheManager.js
├── samples/
│   └── simple-library-usage/
│       └── Code.js
└── docs/
    └── PUBLISHING.md (this file)
```

## Making It Public

To maximize visibility:

1. **Google Apps Script Community**:
   - Share in relevant forums
   - Post on Stack Overflow with proper tags
2. **Documentation Site**:
   - Consider creating a GitHub Pages site
   - Include interactive examples
3. **Social Media**:
   - Share on Twitter/X with #GoogleAppsScript
   - Post on LinkedIn
   - Reddit r/GoogleAppsScript

## Monitoring Usage

Unfortunately, Apps Script doesn't provide usage analytics for libraries. Consider:

- GitHub Stars/Forks as a metric
- User feedback through GitHub Issues
- Community engagement

## Support and Maintenance

1. **Create a GitHub Issues page** for bug reports
2. **Monitor the Apps Script community** for questions
3. **Keep dependencies updated** (if any)
4. **Test with new Apps Script features** as they're released

## Script ID Location

After publishing, share your Script ID in:

- README.md
- GitHub repository description
- Documentation files
- Community posts

Example installation instructions for users:

```markdown
## Installation

1. In your Apps Script project, click **+** next to Libraries
2. Enter Script ID: `YOUR_SCRIPT_ID_HERE`
3. Select the latest version
4. Set identifier to: `GeminiApp`
5. Click **Add**
```

## Troubleshooting

### "Library not found"

- Verify the Script ID is correct
- Make sure the library is deployed (not just saved)

### "Method not found"

- User might need to update to latest version
- Check if method name is correct

### OAuth Scopes

If your library uses restricted scopes:

- Document required scopes in README
- Users will need to authorize them

## Next Steps

After publishing:

1. ✅ Test in multiple projects
2. ✅ Gather user feedback
3. ✅ Create tutorial videos (optional)
4. ✅ Write blog posts about usage
5. ✅ Respond to issues and questions

---

Congratulations on publishing your library! 🎉
