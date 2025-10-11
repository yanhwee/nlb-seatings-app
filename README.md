# NLB Seatings App

Shows seat availabilities for Singapore's NLB libraries.

Designed as a web application with a mobile-first interface.

Built with React & Next.js.

Try it here:.

## More Info

This application gets seat availabilities information from the National Library Board (NLB) via their (unofficial) seat booking API. Data for a new booking day is released every day at 12 noon for the following day's availability.

## Getting Started

Follow these steps to setup the project locally.

**Prerequisites**:

- node.js (v24+)
- npm

**Installation**:

1. Install dependencies: `npm install`

2. Run the development server: `npm run dev`.

The application will be accessible at `localhost:3000`.

## Technical Architecture

- React, Next.js, TypeScript.
- Styling: Vanilla HTML, CSS.
- Database: None (Data accessed via server proxy).
- Server: CORS proxy + data processing + caching
- Server Caching: Lazy, with request coalescing.
- Client Caching: Stale-While-Revalidate pattern (SWR).

## Demo
