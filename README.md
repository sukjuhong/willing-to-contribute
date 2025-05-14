# Willing to Contribute

A browser-based tool to collect, track, and manage beginner-friendly GitHub issues across your favorite repositories.

## Features

### Repository Collection & Issue Exploration

- Manually add GitHub repositories you want to track
- View issues with "good first issue" labels
- Filter issues by custom labels (easy, help wanted, etc.)

### Storage & Sync

- LocalStorage saving for repository list and settings
- GitHub Gist integration for cross-device syncing
- GitHub OAuth login support

### Notification Features

- Browser notifications for new beginner-friendly issues
- Visual "NEW" badge for highlighting recently added issues
- Configurable notification frequency (hourly, 6-hour, daily)

### Issue Management

- Hide or dim closed issues
- Sort and filter issues by age and status

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/willing-to-contribute.git
   cd willing-to-contribute
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env.local` file with your GitHub OAuth app credentials:

   ```text
   GITHUB_CLIENT_ID=your_github_client_id
   GITHUB_CLIENT_SECRET=your_github_client_secret
   NEXT_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id
   NEXT_PUBLIC_GITHUB_REDIRECT_URI=http://localhost:3000
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

### GitHub OAuth App Setup

To use the GitHub authentication features:

1. Register a new OAuth application at [GitHub Developer Settings](https://github.com/settings/developers)
2. Set the Authorization callback URL to `http://localhost:3000` for development
3. Copy the Client ID and Client Secret to your `.env.local` file

## Technologies Used

- Next.js 15
- React 19
- TypeScript
- TailwindCSS
- Octokit (GitHub API)
- SWR for data fetching
- DaisyUI components

## Future Improvements

- Email notifications
- More advanced issue filtering options
- Repository categories and organization
- Issue notes and personal tracking

## License

This project is licensed under the MIT License - see the LICENSE file for details.
