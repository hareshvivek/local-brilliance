# Local Brilliance

Build a marketplace platform named "Local Bridge" that connects local micro-business owners (like bakeries and cafes) with student web developers. The platform needs to handle two distinct user types (Shopkeepers and Students) and a basic Admin role. 

Design the UI to look incredibly professional, modern, and trustworthy. Use a clean, tech-forward color palette (e.g., deep indigo, emerald accent for success/money, and clean white backgrounds) with plenty of whitespace.

Here is the exact structure and functionality required:

1. LANDING PAGE & AUTHENTICATION

- A clean, high-converting homepage explaining the value proposition for both audiences (Shopkeepers: "Get a custom website for $50 + $39/mo". Students: "Build real portfolio pieces and get a stipend").

- Clear "Sign Up as Business" and "Apply as Student" buttons.

- A shared login page that redirects users to their specific dashboard based on their account type.

2. SHOPKEEPER DASHBOARD

- Onboarding Flow: A step-by-step form to input their business details (Name, Category like Bakery/Cafe, Current Instagram link, Menu/Product upload area, and specific design preferences).

- Active Project Tracking: A visual timeline showing the status of their 3-week sprint (Stages: Matched -> Design Phase -> Quality Check -> Live).

- Content Manager (The $39/mo value): A simple dashboard where they can see their live site details and submit a text request to change their hours, menu items, or prices. 

3. STUDENT DASHBOARD

- Portfolio & Profile: A profile page displaying their skills, university/course, and a gallery of websites they have successfully launched through the platform.

- Project Board: A list of available local businesses waiting for a website. Students can click "Request Match".

- Sprint Workspace: Once matched, a page that displays the chosen business's uploaded assets, menu, and preferences. Includes a submit button to send the final staging link to the Admin for quality assurance.

4. ADMIN DASHBOARD (Internal Team View)

- Matchmaker Panel: View pending businesses and pending student requests, with a one-click button to match a student to a project.

- Quality Assurance (QA) Queue: A list of completed student submissions. The admin can click "Approve & Launch to Cloud" or "Send back with feedback notes".

- Revenue & Payout Tracker: A simple dashboard showing active subscriptions ($39/mo pool) and a list of students who have completed their sprint and are cleared for their flat stipend payout.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b3f544f7-f301-405e-be0f-38d63320ddd5).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
