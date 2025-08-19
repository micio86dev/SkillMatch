import * as cron from "node-cron";
import { JobImportService } from "./job-import-service";

export class CronScheduler {
  private jobImportService: JobImportService;
  private isRunning = false;

  constructor() {
    this.jobImportService = new JobImportService();
  }

  start() {
    if (this.isRunning) {
      console.log("Cron scheduler already running");
      return;
    }

    console.log("Starting job import cron scheduler...");
    this.isRunning = true;

    // Schedule job import every 6 hours
    cron.schedule("0 */6 * * *", async () => {
      console.log("Starting scheduled job import...");
      try {
        const results = await this.jobImportService.importJobsFromWeb();
        console.log(`Job import completed:`, results);
      } catch (error) {
        console.error("Error in scheduled job import:", error);
      }
    });

    // Schedule a test run every 30 minutes for development
    if (process.env.NODE_ENV === "development") {
      cron.schedule("*/30 * * * *", async () => {
        console.log("Development job import test run...");
        try {
          const results = await this.jobImportService.importJobsFromWeb();
          console.log(`Test job import completed:`, results);
        } catch (error) {
          console.error("Error in test job import:", error);
        }
      });
    }

    console.log("Cron scheduler started successfully");
  }

  stop() {
    if (!this.isRunning) {
      console.log("Cron scheduler not running");
      return;
    }

    // Stop all scheduled tasks
    cron.destroy();
    this.isRunning = false;
    console.log("Cron scheduler stopped");
  }

  // Manual trigger for testing
  async triggerJobImport(): Promise<{ imported: number; skipped: number; errors: number }> {
    console.log("Manually triggering job import...");
    return await this.jobImportService.importJobsFromWeb();
  }
}