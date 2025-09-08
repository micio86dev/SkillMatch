# VibeSync Job Import System

## 🎯 Overview

This directory contains scripts for importing IT job postings into the VibeSync platform. The system can import jobs from external sources (APIs or web scraping) and process them with AI for normalization and categorization.

## 📁 Scripts

### `importTestJobs.js`
A test script that creates sample jobs in the database for testing purposes.

**Usage:**
```bash
npm run jobs:test-import
```

### `jobImportCron.js`
The main cron job script that imports IT jobs posted in the last 24 hours.

**Usage:**
```bash
npm run jobs:cron
```

**Features:**
- Fetches jobs from external sources (APIs or web scraping)
- Processes jobs with AI for normalization and categorization
- Creates company profiles for new employers
- Stores import records for tracking
- Handles errors gracefully and continues processing

## 🔄 How It Works

1. **Job Fetching**: The system fetches IT job postings from external sources
2. **AI Processing**: Jobs are processed with OpenAI GPT-4 to:
   - Normalize job titles
   - Categorize jobs (frontend, backend, devops, etc.)
   - Clean job descriptions
3. **Data Import**: Processed jobs are imported into the database as projects
4. **Tracking**: Import records are stored for monitoring and debugging

## ⚙️ Configuration

The system uses the following environment variables:

- `MONGODB_URI`: MongoDB connection string
- `OPENAI_API_KEY`: OpenAI API key for job processing (optional)

## 🕐 Cron Job Setup

To run the job import automatically, add this line to your crontab:

```bash
# Run every hour
0 * * * * cd /path/to/vibesync && npm run jobs:cron

# Run every 6 hours
0 */6 * * * cd /path/to/vibesync && npm run jobs:cron

# Run daily at 2 AM
0 2 * * * cd /path/to/vibesync && npm run jobs:cron
```

## 🧪 Testing

To test the job import system:

```bash
# Run the test import script
npm run jobs:test-import

# Run the cron job manually
npm run jobs:cron
```

## 📊 Monitoring

You can monitor the import process by:

1. Checking the console output of the scripts
2. Using Prisma Studio to view imported jobs:
   ```bash
   npm run db:studio
   ```
3. Querying the `jobImports` collection in MongoDB

## 🔧 Customization

To customize the job import system:

1. **Add new sources**: Modify the `fetchJobsFromSources()` function in `jobImportCron.js`
2. **Change AI processing**: Update the prompt in `processJobWithAI()` function
3. **Modify job categorization**: Adjust the categories in the AI prompt
4. **Add new fields**: Update the Prisma schema and import functions

## 🛡️ Error Handling

The system includes robust error handling:

- Failed job imports don't stop the entire process
- Errors are logged for debugging
- AI processing failures fall back to original data
- Database connection errors are handled gracefully

## 📈 Performance

- Jobs are processed sequentially to avoid overwhelming external APIs
- Database operations use Prisma transactions for consistency
- AI processing is optional and can be disabled
- The system can handle large volumes of jobs efficiently