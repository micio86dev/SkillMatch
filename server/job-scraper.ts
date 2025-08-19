import axios from "axios";
import * as cheerio from "cheerio";

export interface RawJobPosting {
  title: string;
  content: string;
  companyName?: string;
  location?: string;
  sourceUrl: string;
}

export class JobScraper {
  private readonly USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

  async scrapeIndeedJobs(query: string = "software developer", location: string = "remote", limit: number = 10): Promise<RawJobPosting[]> {
    const jobs: RawJobPosting[] = [];
    
    try {
      const searchUrl = `https://indeed.com/jobs?q=${encodeURIComponent(query)}&l=${encodeURIComponent(location)}&limit=${limit}`;
      
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': this.USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);

      $('.jobsearch-SerpJobCard, .job_seen_beacon').each((index, element) => {
        if (jobs.length >= limit) return false;

        const $job = $(element);
        const title = $job.find('.jobTitle a span, .jobTitle-color-purple span').first().text().trim();
        const company = $job.find('.companyName a span, .companyName span').first().text().trim();
        const location = $job.find('.companyLocation').first().text().trim();
        const jobKey = $job.find('.jobTitle a').attr('data-jk') || $job.find('a[data-jk]').attr('data-jk');
        
        if (title && company && jobKey) {
          const jobUrl = `https://indeed.com/viewjob?jk=${jobKey}`;
          
          // Get job description preview
          const summary = $job.find('.job-snippet').text().trim() || 
                         $job.find('.summary').text().trim() || 
                         'Job description not available in preview';

          jobs.push({
            title,
            content: `Company: ${company}\nLocation: ${location}\n\n${summary}`,
            companyName: company,
            location,
            sourceUrl: jobUrl
          });
        }
      });

    } catch (error) {
      console.error("Error scraping Indeed jobs:", error);
    }

    return jobs;
  }

  async scrapeGenericJobBoard(baseUrl: string, selectors: {
    jobCard: string;
    title: string;
    company?: string;
    location?: string;
    description?: string;
    link?: string;
  }): Promise<RawJobPosting[]> {
    const jobs: RawJobPosting[] = [];

    try {
      const response = await axios.get(baseUrl, {
        headers: { 'User-Agent': this.USER_AGENT },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);

      $(selectors.jobCard).each((index, element) => {
        const $job = $(element);
        const title = $job.find(selectors.title).text().trim();
        const company = selectors.company ? $job.find(selectors.company).text().trim() : undefined;
        const location = selectors.location ? $job.find(selectors.location).text().trim() : undefined;
        const description = selectors.description ? $job.find(selectors.description).text().trim() : '';
        
        let jobUrl = baseUrl;
        if (selectors.link) {
          const linkHref = $job.find(selectors.link).attr('href');
          if (linkHref) {
            jobUrl = linkHref.startsWith('http') ? linkHref : new URL(linkHref, baseUrl).href;
          }
        }

        if (title) {
          jobs.push({
            title,
            content: `${company ? `Company: ${company}\n` : ''}${location ? `Location: ${location}\n` : ''}\n${description}`,
            companyName: company,
            location,
            sourceUrl: jobUrl
          });
        }
      });

    } catch (error) {
      console.error(`Error scraping ${baseUrl}:`, error);
    }

    return jobs;
  }

  async scrapeJobDetail(jobUrl: string): Promise<string> {
    try {
      const response = await axios.get(jobUrl, {
        headers: { 'User-Agent': this.USER_AGENT },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      
      // Common selectors for job descriptions
      const descriptionSelectors = [
        '.jobsearch-jobDescriptionText',
        '.job-description',
        '.description',
        '.jobdescription',
        '[data-testid="jobDescription"]',
        '.job-details',
        'main',
        'article'
      ];

      for (const selector of descriptionSelectors) {
        const content = $(selector).text().trim();
        if (content && content.length > 100) {
          return content;
        }
      }

      // Fallback: get all text content
      return $('body').text().trim().substring(0, 2000);

    } catch (error) {
      console.error(`Error scraping job detail from ${jobUrl}:`, error);
      return '';
    }
  }

  // Predefined job board configurations
  async scrapeMultipleJobBoards(): Promise<RawJobPosting[]> {
    const allJobs: RawJobPosting[] = [];

    // Indeed jobs
    const indeedJobs = await this.scrapeIndeedJobs("software developer", "remote", 5);
    allJobs.push(...indeedJobs);

    // You can add more job boards here
    const jobBoards = [
      {
        name: "AngelList",
        url: "https://angel.co/jobs",
        selectors: {
          jobCard: '.job-listing',
          title: '.job-title',
          company: '.company-name',
          location: '.location',
          description: '.job-description'
        }
      }
      // Add more job boards as needed
    ];

    for (const board of jobBoards) {
      try {
        const jobs = await this.scrapeGenericJobBoard(board.url, board.selectors);
        allJobs.push(...jobs.slice(0, 3)); // Limit per board
      } catch (error) {
        console.error(`Error with ${board.name}:`, error);
      }
    }

    return allJobs;
  }
}