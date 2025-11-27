# Technical Notes

## What Was Built

A customer portal where users can:
- Log in with email and phone number
- See their bookings from ServiceM8
- View booking details (address, date, notes)
- Look at photos and download files attached to jobs
- Send messages about their bookings

**Tech used:** Next.js for frontend, Express.js for backend, ServiceM8 API for real data.

---

## Reasoning Behind My Approach

**Why separate frontend and backend?**
The requirements said to use Express.js, so I couldn't just use Next.js API routes. Keeping them separate also makes the code cleaner.

**Why email + phone login?**
Simple for customers - no password to remember. The phone number acts like a second verification step.

**Why proxy attachments through the backend?**
ServiceM8 needs an API key to access files. Browsers can't add API keys to image requests, so the backend fetches the image and passes it to the frontend.

**Why store messages in a JSON file?**
Quick to set up for a POC. No database configuration needed. Easy to check if it's working.

**Why dark theme?**
Looks modern and professional. Wanted to avoid the generic look that AI-generated UIs often have.

---

## Assumptions Made

- Email + phone is enough to identify a customer
- All jobs in the ServiceM8 account can be shown to the logged-in user
- Customers can see all attachments on their bookings
- No need for user registration (customers already exist)
- App runs locally on ports 3000 and 3001

---

## Potential Improvements

**Security:**
- Add HTTPS for production
- Rate limit login attempts
- Use signed URLs for attachments instead of public endpoints

**Features:**
- Let customers cancel or reschedule bookings
- Send email notifications when there's a reply
- Add search and filters for bookings
- Upload photos when sending messages

**Technical:**
- Replace JSON file with a real database
- Add automated tests
- Containerize with Docker for easier deployment

---

## How AI Assisted My Workflow

**What AI helped with:**
- Figuring out ServiceM8 API authentication (tried Basic Auth first, didn't work, AI found it uses X-API-Key header)
- Debugging issues like image loading and CORS errors
- Writing documentation

