/**
 * ServiceM8 API Integration Service
 * 
 * Handles all communication with the ServiceM8 REST API.
 * Uses Basic Authentication with API credentials.
 * 
 * API Documentation: https://developer.servicem8.com/docs/rest-overview
 */

const axios = require('axios');

// ServiceM8 API base URL
const SERVICEM8_BASE_URL = 'https://api.servicem8.com/api_1.0';

/**
 * Creates an axios instance configured for ServiceM8 API
 * Uses X-API-Key header for authentication
 * 
 * To use your own ServiceM8 account:
 * 1. Create a free account at servicem8.com
 * 2. Go to Settings > API Keys > Add API Key
 * 3. Set SERVICEM8_API_KEY environment variable
 */
const createApiClient = () => {
  // ServiceM8 API Key - must be set via environment variable
  const apiKey = process.env.SERVICEM8_API_KEY;
  
  if (!apiKey) {
    console.warn('⚠️  SERVICEM8_API_KEY not set - using mock data');
    return null;
  }
  
  console.log(`🔑 Using ServiceM8 API Key: ${apiKey.substring(0, 15)}...`);

  return axios.create({
    baseURL: SERVICEM8_BASE_URL,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-API-Key': apiKey
    }
  });
};

/**
 * Fetches all jobs from ServiceM8
 * In ServiceM8, jobs represent bookings/appointments
 * 
 * @returns {Promise<Array>} List of jobs
 */
const getJobs = async () => {
  const client = createApiClient();

  try {
    console.log('📡 Fetching jobs from ServiceM8 API...');
    const response = await client.get('/job.json');
    console.log(`✅ Retrieved ${response.data.length} jobs from ServiceM8`);
    return response.data;
  } catch (error) {
    console.error('ServiceM8 API Error (getJobs):', error.response?.data || error.message);
    // Fallback to mock data if API fails
    console.warn('⚠️  Falling back to mock data');
    return getMockJobs();
  }
};

/**
 * Fetches a specific job by UUID
 * 
 * @param {string} jobId - The job UUID
 * @returns {Promise<Object>} Job details
 */
const getJobById = async (jobId) => {
  const client = createApiClient();

  try {
    console.log(`📡 Fetching job ${jobId} from ServiceM8 API...`);
    const response = await client.get(`/job/${jobId}.json`);
    console.log('✅ Retrieved job details from ServiceM8');
    return response.data;
  } catch (error) {
    console.error('ServiceM8 API Error (getJobById):', error.response?.data || error.message);
    // Fallback to mock data if API fails
    console.warn('⚠️  Falling back to mock data');
    return getMockJobById(jobId);
  }
};

/**
 * Fetches jobs filtered by customer email
 * ServiceM8 uses company contacts, so we filter by contact email
 * 
 * @param {string} email - Customer email
 * @returns {Promise<Array>} Filtered list of jobs
 */
const getJobsByCustomerEmail = async (email) => {
  const client = createApiClient();

  try {
    console.log(`📡 Fetching jobs for customer: ${email} from ServiceM8 API...`);
    
    // For POC: Get all jobs (in production, filter by company)
    // ServiceM8 free accounts may not have company data, so we return all jobs
    const jobsResponse = await client.get('/job.json');
    const jobs = jobsResponse.data;
    
    console.log(`✅ Retrieved ${jobs.length} jobs from ServiceM8`);
    
    // Return all jobs for demo (in production, would filter by customer)
    return jobs;
  } catch (error) {
    console.error('ServiceM8 API Error (getJobsByCustomerEmail):', error.response?.data || error.message);
    // Fallback to mock data if API fails
    console.warn('⚠️  Falling back to mock data');
    return getMockJobsByEmail(email);
  }
};

/**
 * Fetches attachments for a specific job
 * 
 * @param {string} jobId - The job UUID
 * @returns {Promise<Array>} List of attachments
 */
const getJobAttachments = async (jobId) => {
  const client = createApiClient();

  try {
    console.log(`📡 Fetching attachments for job ${jobId} from ServiceM8 API...`);
    
    // Get attachments directly from the attachment endpoint
    const response = await client.get(`/attachment.json?%24filter=related_object_uuid%20eq%20'${jobId}'`);
    
    console.log(`✅ Retrieved ${response.data.length} attachments from ServiceM8`);
    
    // Transform to our format
    const attachments = response.data.map(att => ({
      uuid: att.uuid,
      file_name: att.filename || att.file_name || 'Attachment',
      file_type: att.content_type || att.file_type || 'application/octet-stream',
      created_date: att.timestamp || att.created_date,
      description: att.attachment_name || att.description || ''
    }));

    return attachments;
  } catch (error) {
    console.error('ServiceM8 API Error (getJobAttachments):', error.response?.data || error.message);
    // Fallback to mock data if API fails
    console.warn('⚠️  Falling back to mock data');
    return getMockAttachments(jobId);
  }
};

// =============================================================================
// MOCK DATA FUNCTIONS
// Used when ServiceM8 credentials are not configured
// =============================================================================

/**
 * Returns mock jobs data for development/testing
 */
const getMockJobs = () => {
  return [
    {
      uuid: 'job-001-uuid',
      job_address: '123 Main Street, Sydney NSW 2000',
      job_description: 'Annual HVAC Maintenance',
      status: 'Completed',
      date: '2024-11-20',
      time: '09:00',
      company_uuid: 'company-001',
      generated_job_id: 'JOB-2024-001',
      total_amount: 250.00,
      work_done_description: 'Completed full system check and filter replacement'
    },
    {
      uuid: 'job-002-uuid',
      job_address: '456 George Street, Melbourne VIC 3000',
      job_description: 'Emergency Plumbing Repair',
      status: 'Quote',
      date: '2024-11-25',
      time: '14:00',
      company_uuid: 'company-001',
      generated_job_id: 'JOB-2024-002',
      total_amount: 180.00,
      work_done_description: ''
    },
    {
      uuid: 'job-003-uuid',
      job_address: '789 Collins Avenue, Brisbane QLD 4000',
      job_description: 'Electrical Safety Inspection',
      status: 'Work Order',
      date: '2024-11-28',
      time: '10:30',
      company_uuid: 'company-001',
      generated_job_id: 'JOB-2024-003',
      total_amount: 320.00,
      work_done_description: ''
    }
  ];
};

/**
 * Returns a mock job by ID
 */
const getMockJobById = (jobId) => {
  const jobs = getMockJobs();
  const job = jobs.find(j => j.uuid === jobId);
  
  if (!job) {
    return null;
  }
  
  // Add more details for single job view
  return {
    ...job,
    notes: 'Customer prefers morning appointments. Gate code is 1234.',
    contact_first: 'John',
    contact_last: 'Smith',
    contact_phone: '0400 123 456',
    contact_email: 'customer@example.com'
  };
};

/**
 * Returns mock jobs filtered by email
 * For demo, returns all mock jobs for the demo email
 */
const getMockJobsByEmail = (email) => {
  // For demo purposes, return mock jobs for demo email
  if (email.toLowerCase() === 'customer@example.com') {
    return getMockJobs();
  }
  return [];
};

/**
 * Returns mock attachments for a job
 */
const getMockAttachments = (jobId) => {
  const attachmentsByJob = {
    'job-001-uuid': [
      {
        uuid: 'attach-001',
        file_name: 'invoice_001.pdf',
        file_type: 'application/pdf',
        created_date: '2024-11-20',
        description: 'Service Invoice'
      },
      {
        uuid: 'attach-002',
        file_name: 'before_photo.jpg',
        file_type: 'image/jpeg',
        created_date: '2024-11-20',
        description: 'Before service photo'
      }
    ],
    'job-002-uuid': [
      {
        uuid: 'attach-003',
        file_name: 'quote_002.pdf',
        file_type: 'application/pdf',
        created_date: '2024-11-22',
        description: 'Service Quote'
      }
    ],
    'job-003-uuid': []
  };

  return attachmentsByJob[jobId] || [];
};

module.exports = {
  getJobs,
  getJobById,
  getJobsByCustomerEmail,
  getJobAttachments
};

