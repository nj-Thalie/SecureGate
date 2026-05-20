# SecureGate — Reflection & Engineering Analysis

**Name:** Nephtalie Joseph
**Cohort:** Design to MVP Bootcamp
**Live URL:** [Your Vercel deployment link]
**GitHub Repo:** [Your repo URL]

---

## Part 1 — What I Built

I built SecureGate which an authentication app. I implemented sign up, login, email verification with expiring tokens, forgot password and reset password flows and a protected dashboard accessible only to verified users.

---

## Part 2 — What Surprised Me

What surprised me was that it wasn't easy like I thought, after solving the sign up problem, I still encountered issues signing in which I solve by clicking forgot Password and then typing a New Password.

---

## Part 3 — Engineering Laws Quiz

I honestly didn't have enough time to answer the 15 questions.

---

## Part 4 — One Thing I Would Refactor

I honestly didn't have enough time to answer this question.

---

## Part 5 — How This Changes How I Build

Before this task, I imagined and thought passwords were saved as plain text in the backend databse, while stiil being secured however building SecureGate taught me that passwords must always be hashed using bcrypt, which adds a unique random value to each password before encrypting it, so even if something happens to the database, the password won't be recovered. I also learnt that tokens are actually temporary random keys with expiry times that allows secure flows like email verification and password resets keeping sensitive data secured and safe. Going forward, I will be more mindful when building any feature that touches user identity without first understanding the security system underneath it.