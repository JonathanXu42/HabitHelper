<template>
  <Header v-if="userStore.isLoggedIn"></Header>
  <div class="progressLog">
    <h1>Progress Log</h1>

    <ProgressLogEntry date="July 3rd, 2025">
      I've decided to build a habit streak website to add to my resume. I'm using Javascript for the entire tech
      stack – Vue.js for the frontend and Node.js for the backend. For the database, I'm going to use a MongoDB
      NoSQL database since this is going to be a write-heavy application where users are constantly adding,
      deleting, and editing the habits they want to keep track of. NoSQL databases usually have better write
      performance than relational databases, and I've always wanted to try out MongoDB.

      <br><br>
      In this first update, I've initialized a Vue.js frontend that runs on localhost port 5173 and a Node.js
      frontend that runs on localhost port 3000. I installed the concurrently package so that the frontend and
      backend will fire up at the same time when I run "npm run dev." I'm also using the nodemon package so that
      my Node.js backend will restart automatically when I make changes to it.
      
      <br><br>
      So far I have four webpages in my website: a login screen where users can also create an account, a landing
      page after the user logs in successfully, a forgot password page that the user can access from the login
      screen, and of course, this progress log page.

      <br><br>
      I don't have a database yet to store users and passwords, so currently the login screen accepts any
      combination of a validly formatted email address and any password. What I'm most proud of in this update is
      the forgot password page, where the user enters their email and gets sent a random 6 digit verification code.
      This is the first time that I've ever implemented automated emails within an application, and it was quite the
      learning experience.

      <br><br>
      I went with Nodemailer since that's the most popular Node.js package for sending emails, and I created two APIs:
      one for sending verification codes, and one for sending notification emails to help users stay on track with their
      habits. I created a new gmail account, habithelper247@gmail.com, to send outbound emails (habithelper@gmail.com 
      was already taken, so I appended 24/7 at the end – yay toxic productivity!)

      <br><br>
      It turns out that for security reasons, after 2022 Google stopped allowing apps like mine to log into someone's email
      account with just their username and password, and start sending emails. Now, I have to use OAuth2 authentication –
      specifically 3 legged OAuth authentication (3LO) – which a clientId (public identifier for my app), a clientSecret
      (code known only to me and Google), and a refreshToken (long-lived token used to obtain access tokens). In order to
      obtain all of these, I was required to create a project on Google's Cloud Console, enable Gmail API, and jump through
      a couple more hoops. These secrets I will be storing in my .env file, which I will not be committing to Github. 
    </ProgressLogEntry>

    <ProgressLogEntry date="July 4th, 2025">
      I've created a header/navbar component that will end up being used on the majority of the pages in this website,
      including this one. I've also created a custom 404 resource not found error page that'll appear in the event that a 
      user types in the name of a page that doesn't exist.

      <br><br>
      I decided to try allowing users to sign in using 3rd party email providers. For the time being, I'm only going to
      support Google accounts/Gmail, since I already did much of the legwork when I set up the Gmail API. I installed the
      frontend library vue3-google-login and the backend library google-auth-library.

      <br><br>
      One day later...

      <br><br>
      Well, that was an awful experience. I wanted to reuse the clientID and clientSecret that I generated on Google's
      Cloud Console when I was implementing the Gmail API, since this login feature is a core part of OAuth2 authentication
      and in theory I wouldn't have to enable any additional APIs to get it working. 

      <br><br>
      This was the first issue I ran into: "Uncaught (in promise) Error: Prop client id required since plugin is not 
      initialized with a client id". That basically means that the Google Login plugin I imported from the vue3-google-login
      library couldn't figure out what my clientID was. I double-checked the filepath to my .env file, appended VITE_ to the 
      beginning of my clientID name so that Vite could automatically load it and I wouldn't have to manually resolve filepaths,
      I tried importing the clientID in main.js so that my Vue files would have access to it, and I even tried clearing
      Vite's cache.

      <br><br>
      In the end, the issue was that I was using a named import in main.js instead of a default import. More confusingly,
      I was supposed to use a default import in main.js to set up the plugin, and then a named import in Login.vue to import
      the GoogleLogin component.

      <br><br>
      After resolving this issue, I got a 403 error upon loading the login page, with the GSI logger stating in the console that
      "The given origin is not allowed for the given client ID". I figured out pretty quickly that this meant that I didn't
      authorize the correct Javascript origins in Google Cloud Console, preventing Google Login plugin from executing. I checked
      to make sure that I was using http when accessing my project in my localhost instead of https, and I thought for sure that
      authorizing "http://localhost:5173" (the port number of my Vue.js frontend) as a Javascript origin would be enough, but for 
      some reason, I had to also authorize "http://localhost" (without the port number).

      <br><br>
      The third major bug I encountered was by far the worse and it led me to abandon using vue3-google-login entirely and
      switch to using passport.js. The GoogleLogin button in my Login.vue file was supposed to call one of two functions depending
      on whether the login was successful: onGoogleSuccess() and onGoogleError(). No matter what I did, it wouldn't call either
      function. I tried creating my own custom button with the GoogleLogin component as a wrapper, but that didn't help. I tried
      adding and removing quotes around the function calls, thinking the component might not recognize the function names, but to
      no avail. I thought maybe my version of vue3-google-login was outdated, but version 2.0.33 is the latest stable version.

      <br><br>
      In the end, I switched to passport.js, which relies much more on the backend in comparison to vue3-google-login. I got it
      working in almost no time at all and didn't encounter any significant bugs, although the resulting code is longer and more
      complex than what I would've ended up with if vue3-google-login had worked.
    </ProgressLogEntry>

    <ProgressLogEntry date="July 5th, 2025">
      Today I set up a MongoDB database and Prisma as an ORM. I'm using a NoSQL database because they usually offer better performance
      than SQL databases for write-heavy applications, and I expect most active users of this website to be making writes everyday,
      sometimes multiple times a day, whether it's adding, updating, or deleting a habit. MongoDB is the most popular NoSQL database
      and it's something I've always wanted to learn. I know Mongoose is the most popular ORM for MongoDB, and that it offers certain
      advanced features that Prisma doesn't offer, but I think it makes more sense to double down on Prisma for the sake of my resume,
      since I've used it before.

      <br><br>
      I'm using MongoDB Atlas to store my database in the cloud, so I won't have to worry about storing it on my localhost or in my
      Github repository. Storing my database in the cloud will offer a more seamless transition when I deploy the rest of my project to
      the cloud, plus Atlas offers a free tier that'll be more than enough for my needs in development. My prisma schema and all migration 
      files will reside in a prisma folder, inside my server directory where I'm keeping all my backend files, including my Node.js files.

      <br><br>
      My Prisma schema is as follows: every User has an ID, a first name, a last name, an email, and a timezone. Users who log in using an
      email and password combo will have a password, while users who log in with Gmail or another email provider won't have a password.
      In the future, I want to support text notifications and add a phone number to the User schema, but right now I want to focus on email
      notifications.

      <br><br>
      Users can have between 0 and many Habits, and each Habit has a UserID representing what User it's tied to. Habits have names, a longest
      streak integer, a current streak integer, an array that contains the days of the week when the user wants to work on the habit, a goal
      (which can be numeric or boolean), and email reminder settings where the user can determine if they'd like to be reminded about their
      habits, and what times of day they'd like to be reminded.

      <br><br>
      Each Habit has between 0 and many HabitLogs, and each HabitLog has a UserID and a HabitID indicating what User and Habit they're tied to.
      HabitLogs are a way for users to write daily notes about their habits. 
    </ProgressLogEntry>

    <ProgressLogEntry date="July 6th, 2025">
      I fleshed out the login and logout features today. I'm using session-based authentication using MongoDB and Prisma, and instead of trying 
      to manage sessions manually by creating a collection in my Prisma schema, I decided to install connect-mongo to manage sessions for me,
      together with express-session.

      <br><br>
      Currently, the only way users can sign out is by clicking the Sign Out button at the top of the header, and all this does is redirect the
      user to the login page. Session-based authentication requires the server and the user to have a matching session and a matching cookie, 
      respectively, and in order to make the Sign Out button actually sign users out, I need to make the Sign Out button destroy the session
      stored on the server and invalidate the user's cookie.

      <br><br>
      I accomplished this by creating a backend API for the route "/auth/logout" that destroys the session first and the cookie second, and then
      making the Sign Out button in the Header.vue file make a GET request to that API upon being clicked. Since my frontend and backend are
      running on different ports, I had to install and configure the cors package in npm to get this to work. 

      <br><br>
      I added a First Name, Last Name, and Timezone attribute to the create account section of the login page. The first two were pretty simple.
      The Timezone attribute was a bit of a challenge because there's so many timezones. There's 38 UTC offsets, but since different places might
      observe daylight savings time at different times or not at all, you end up with over 400 different timezones. In the end, I decided that
      it would be better to suffer through a long list of timezones once and never have to worry about it again, than for email reminders to be
      thrown off if the user's timezone changes due to daylight savings time.

      <br><br>
      The second choice I had to make with regards to timezones was how to implement them and where to get the list of timezones from. 
      Intl.supportedValuesOf('timezone') is a built-in function in modern Javascript that returns a list of over 400 timezones in alphabetical 
      order, but it only works in modern browsers and I'd have to create a fallback list for older browsers. I ended up installing the package
      moment-timezone so I wouldn't have to worry about browser versions.

      <br><br>
      Finally, I rolled out two features to make the process of selecting a timezone less anguishing. The first is guessing and preselecting
      the user's timezone in the dropdown menu. The second is making the timezones searchable, by both name and UTC offset.
    </ProgressLogEntry>

    <ProgressLogEntry date="July 7th, 2025">
      Today's the most productive day I've had while working on this project. It took me a long time, but I finally finished the login and logout 
      features. Hold your breath, here's a summary of how my website handles signups, logins, and logouts:
      
      <br><br>
      - When a user who doesn't have an account tries to log in using an email and password, the website won't let them. The user must
        first create an account by providing an email, password, and timezone. Originally I was gonna require first and last names, but I'm
        gonna make them optional. Once the user creates an account, the website logs the user in automatically
      <p>- When a user who doesn't have an account tries to log in using their gmail account, the website creates an account for them and
        logs them in automatically. No need for manual account creation when you sign in with gmail. The website will automatically set a
        first name, last name, and timezone based off the user's gmail account, but no password, which is important because...</p>
      <p>- When a user who has an account associated with gmail, tries to log in using a password and email combo, the website won't let them.
        They must first either set a password in the settings page (I'm going to add this) or log in with gmail</p>
      <p>- When a user creates an account with a gmail address and password, and tries to log in using their gmail, the website will let them.</p>

      <br>Wanna know why I was stuck for so long on the create account route in my backend? <Spoiler text="I forgot to import PrismaClient. Le sigh..."/>

      <br><br>
      I also updated the reset password page so that now, users can reset their passwords (or in the case of gmail logins, set their passwords
        for the first time). I also added a navigational guard defined in my src/auth.js file so that users can't access the landing page if they're
        not logged in. If I want to create more webpages in the future that need to be protected, it's as easy as adding one line of code to
        src/router/index.js.
    </ProgressLogEntry>

    <ProgressLogEntry date="July 8th, 2025">
      I created a settings page where users can update their first name, last name, and timezone, and also delete their account. Deleting one's
      account will also delete all the Habits and HabitLogs associated with the user.

      <br><br>
      I installed Pinia today as well. Pinia is Vue 3's official state management library and it allows me to store and manage data in one place and
      share it across components and pages. Previously, my website had to make a request to the backend everytime the user visited a page protected
      by a navigational guard, in order to figure out if the user was authenticated and should be allowed to view the page. With Pinia, my website
      can fetch the data once and store it in memory. The same is true for the timezone dropdown menu on my Login and Settings pages. My website will
      now create a list of 400+ timezones only once and then store it in localStorage, instead of creating it everytime the user loads the Login or
      Settings page. 
    </ProgressLogEntry>

    <ProgressLogEntry date="July 9th, 2025">
      It appears that the refresh token I use to allow my website to automatically send emails from my gmail account, has expired. I wrote a script 
      using the npm "open" package to get a new refresh token the next time this happens, to save me some time. Since I'm the only user/developer of 
      this site who's ever going to need a refresh token, I'm not uploading this script to my Github repo.

      <br><br>
      I noticed that whenever I'm logged in with multiple gmail accounts in Google Chrome and I sign into the website with gmail, Google lets me select
      what account I want to log in with. However, when I'm logged in with only one gmail account, Google selects that as the default account to log me
      in with. I edited the Google Strategy in my passport.js file so that Google will always ask the user to select what gmail account they want to
      log in with.
    </ProgressLogEntry>

    <ProgressLogEntry date="July 10th, 2025">
      Good work today. I made all of a user's habits display on the landing page and gave the user the ability to edit and delete habits from the
      landing page. I also made a separate Create Account page for creating an account using an email/password combination, since Login.vue, which has
      been handling all of my logins and signups is getting a little bit too long and hard to maintain. Now when a user wants to create an account
      using an email and password, they'll be sent a verification code, which should prevent malicious actors from creating tons of fake accounts.

      <br><br>
      Along the same line of thinking, I added some protections to ensure that certain pages can only be accessed by users who are logged in and
      authenticated. My frontend has always been protected by a navigational guard that checks if the user is authenticated before letting them
      visit certain pages, but this wouldn't have stopped someone from using a tool like Postman or Curl to make requests to my backend without
      interacting with the frontend.
    </ProgressLogEntry>

    <ProgressLogEntry date="July 11th, 2025">
      In the same vein, I'm gonna start saving the verification code that users need to reset their password or create an account with an
      email/password combination, in the backend instead of the frontend. This is so that malicious actors can't type in random people's emails
      and create a bunch of accounts by digging through the frontend source files for the variable where the verification code is stored. While
      techniques like minification and obfuscation of frontend source files make reading them more difficult, at the end of the day, all frontend
      code gets sent to the user's computer to be executed there, and so you can't stop the user or his computer from figuring out what the
      frontend source files do if you want to have a functioning website. Backend files execute on a server, not the user's computer, so the
      verification codes should be much safer when stored in the backend. I also added a 5 minute expiration timer to the verification codes.

      <br><br>
      I implemented email reminders today using the luxon package to keep track of the date and time and the node-cron package to check for jobs
      that have to be performed on an interval. In my case, since users can set an email reminder for any time of day, the cron scheduler will
      have to check every user for emails that ought to be sent out, every minute of everyday, 24/7. I'm worried this could cost me a lot
      in server resources in a production environment.
    </ProgressLogEntry>

    <ProgressLogEntry date="July 12th, 2025">
      I did some work implementing habit logs today. Now every habit that appears on a user's landing page has a View Logs button that takes
      the user to a page dedicated to logs for that habit. Technically speaking, habit logs always appear on the same page – HabitLog.vue –
      but only one habit's logs are shown at a time. When the user clicks the View Logs on a habit card in the landing page, the website
      passes the habitID in the URL, and the habit log page knows which habit's logs to retrieve.

      <br><br>
      The user can currently only view and create logs. I'm debating whether or not the user should be able to edit and delete logs. The first
      time each day that the user creates a log that's marked "completed" (meaning the user worked on that habit that day), the habit's current 
      streak counter in the landing page gets incremented by 1. If the current streak is longer than the longest streak, the longest streak
      also gets updated.

      <br><br>
      Deleting a habit deletes all of the habit logs.
    </ProgressLogEntry>

    <ProgressLogEntry date="July 13th, 2025">
      I came up with a more efficient system for scheduling email reminders. Instead of checking all habits from every user every minute of
      the day, I'm going to use a scheduled queue system using a ScheduledReminder model I added to the Prisma schema. Every time a user
      adds, edits, or deletes a habit, or when a user changes their timezone, the website will add, edit, or delete scheduled reminders
      belonging to that habit or that user. When an email reminder is sent, a new reminder is scheduled for the same time, a week from now.

      <br><br>
      The system still performs checks every minute, but instead of searching through all habits belonging to all users, it searches through
      all scheduled reminders. The number of scheduled reminders may be greater than the number of habits, so you might think that this new
      system would be even slower, but I've added an index on the sendAt attribute, which means that the system finds scheduled reminders that
      are about to be sent, first. This makes the search function run in 1/1440th the time (1440 minutes per day and assuming that users are
      equally likely to schedule reminders at any given time of day, which they are not).
    </ProgressLogEntry>

    <ProgressLogEntry date="July 14th, 2025">
      <p>Today was mainly bug fixes and minor improvements:</p>
      <p>- Fixed bug where streaks were being reset everyday even on days when users weren't planning on working on their habits</p>
      <p>- Built function to send users emails whenever they break a streak</p>
      <p>- Popup menu gets too tall when users add too many email reminder times to a habit, so I added the ability for users to scroll up or down the menu</p>
      <p>- Made the header component appear on the reset password and progress log pages only if the user is logged in</p>
      <p>- Gave users the ability to edit and delete habit logs</p>
    </ProgressLogEntry>

    <ProgressLogEntry date="July 15th, 2025">
      Now that I'm pretty much done with the backend, I can focus on the frontend and making the UI look pretty. I worked on the login page,
      header, settings page, and progress log page today.

      On the settings page, I gave users the ability to change their emails, with the requirement that they receive a verification code at
      their new email address and enter that in. This is to prevent users from accidentally switching their accounts over to the wrong email
      then being locked out. I'm also making users go through this same process if they want to delete their accounts, since this is far more
      secure than having the user simply retype their email to confirm account deletion.
    </ProgressLogEntry>
    
    <ProgressLogEntry date="July 16th, 2025">
      Today I worked on the frontend for the reset password page, landing page, habit modal, and habit log modal. I got rid of the TextInput
      component and switched to using native HTML input elements because the TextInput styles were being applied universally to all TextInputs,
      no matter what page they were on, whereas using native inputs offers me more customizability and specificity. The TextInput.vue file
      didn't contain any reusable logic, and it was causing more hassle than it was saving.
    </ProgressLogEntry>

    <ProgressLogEntry date="July 17th, 2025">
      Big day with a lot of changes today! I've started preparing my website for cloud deployment. My MongoDB database is already in the cloud,
      so that part's easy. I focused a lot on upgrading my website's security. 
      
      Here's a quick list of some of the changes I made:
      - installed Node.js's helmet package to set HTTPS headers to protect against cross-site scripting and other vulnerabilities
      - installed Node.js's compression package to minify and obfuscate frontend source files
      - implemented secure session cookies and HTTPS instead of HTTP
      - set up HSTS header to prevent protocol downgrade attacks
      - installed Node.js's csurf package and added CSRF middleware
      - implemented rate limiting on backend routes involving logins and verification codes using Node.js's express-rate-limit package. Users
      are allowed 5 backend requests a minute
    </ProgressLogEntry>

    <ProgressLogEntry date="July 19th, 2025">
      I finally replaced Javascript's native alert and confirm popups with some nicer looking custom notifications/popups. I used the Toast
      package for Vue to replace the alerts with notifications that pop up in the top right corner of the screen and have a green and grey
      color scheme going on. I replaced the confirmation popups with a ConfirmDialog component stored in ConfirmDialog.vue.
    </ProgressLogEntry>

    <ProgressLogEntry date="July 28th, 2025">
      It took a while, but I was finally able to deploy my project to the cloud – specifically Google Cloud Run. The first thing I had to do
      before actually deploying it to Google Cloud was to first containerize my project using Docker and ensure that my Docker container
      would be able to run on my local machine first.

      My first dilemma was picking a base image of Node.js that didn't have any security vulnerabilities. VSCode checks Docker base image 
      layers for known CVEs, and the Alpine, Debian, and slim versions of Node version.js 22.13.1, which my project was using, all had known
      vulnerabilities. Since Alpine has the fewest of them and is the smallest, I decided to go with Alpine.

      During local testing, my project was essentially split up into three parts: I had my frontend and backend in a Docker container, my
      MongoDB database which was already running in the cloud via MongoDB Atlas, and my .env file on my local machine that was providing
      environment variables needed for my project to connect to the MongoDB database and access Gmail APIs. Prisma had some trouble initially
      connecting to the database, which I ended up fixing by running "npx prisma generate" inside the Dockerfile and removing quotation marks
      from around the DATABASE_URL variable in my .env file.

      I set up my server/index.js file so that it would enforce HTTPS and SSL if the NODE_ENV variable in .env was set to "production," but
      wouldn't if it was set to "development." In my Dockerfile, I set the NODE_ENV variable as "production", but I had it set to "developemnt"
      in my .env file, and it turns out that when I ran my Docker container with an --env-file flag, the environment variables in my .env file
      override the environment variables in my Dockerfile. This meant that I wasn't able to test my project with HTTPS, so I ended up changing
      NODE_ENV in .env to "production." Really interesting behavior

      One unexpected bug that happened when I was testing my container was with automatically detecting the user's timezone when creating an
      account. I use the Passport.js library to create new accounts for users who sign up with their gmail account, whereas when users sign up
      with an email and password combination, I use Node.js's moment library to detect their timezone. Passport.js was giving me a neutral
      timezone with no UTC offset, while moment was correctly guessing my timezone (America/New_York, UTC-4). It turns out that because moment
      was running in the browser, it had access to my timezone, but Passport.js was running in the backend and was returning the server's
      timezone (my container's environment).

      There's no way to accurately detect a user's timezone from the backend, unless I base it off their IP address which would've been clunky
      or invasive, so instead I had the frontend Login.vue file detect the user's timezone, save it in session storage, and then send it to my
      backend. Problem solved.

      After getting my Docker container to work locally, it was time to deploy it. I downloaded Google Cloud CLI, added my environment variables
      to Google Secret Manager, and pushed my Docker image to Google Artifact Registry. From this point on, I had to tweak the Docker image two
      or three times to squash some bugs, but it was mostly a matter of configuring environment variables and setting up infrastructure
      like VPCs and NATs in order to get the containers to work.

      One convenient feature about Google Cloud Run is that it handles HTTPS and SSL/TLS for me, so I didn't have to worry about adding .pem files
      or SSL certs to Google Secret Manager. I ran into a couple of CORS errors because some parts of my project had hardcoded references to
      localhost port 3000 and my authorized Javascript origins and redirect URIs were localhost addresses, so I had to change those around.

      This was a little trickier than you might imagine. Google Cloud Run is supposed to assign my project a URL after it successfully deploys it,
      but I couldn't successfully deploy it without being first assigned a URL because my project would fail immediately due to the aforementioned
      CORS errors! Thankfully, after doing a bit of digging in Google Cloud Console, I found the URL that GCP <i>would have</i> assigned my project
      if it had succeeded.

      Another error I ran into had to do with the cron job I've got that checks for scheduled email reminders every minute. In order to access my gmail
      account and send emails from it, my website had to access several environment variables from Google Secret Manager like
      VITE_GOOGLE_CLIENT_ID, CLIENT_SECRET, and REFRESH_TOKEN, then create an OAuth2 client, then get an access token from the Oauth2 client. I was
      getting a Gaxios invalid client error when my project started up, so my first thought was that the website wasn't able to read the environment
      variables from Google Secret Manager, and that's why it failed to create a valid OAuth2 client.

      My first line of thinking was to add some console.log statements to the top of my server/index.js file, to check that the website was able to
      get the right values for the environment variables. To my surprise, my project kept failing before any of the print statements were triggered, and
      I couldn't tell what was wrong or if my website had the correct values. After doing some research, I learned that Google Cloud Run only injects
      environment variables from Google Secret Manager at runtime. My website was failing before the print statements ever got a chance to execute because
      it was trying to initialize an OAuth2 client at buildtime, when the environment variables are still undefined.

      I had to lazy-load/lazy-initialize the OAuth2 client creation and access token fetching, so that it only runs when my cron job runs. Every minute,
      my cron job checks if there's a valid OAuth2 client, and if there isn't, it creates one. Obviously, it will only ever create an OAuth2 client one
      time for every container deployment, but the overhead of checking whether there's a valid OAuth2 client is minimal. Although my cron job runs every
      minute, this was enough of a delay to allow my environment variables to be injected from Google Secret Manager.

      The last major bug I encountered was trying to grant my website production access to my MongoDB database. I never had an issue with this in
      development because I enabled all read/write traffic originating from my IP address, but now my website was running from the IP address of a
      Google-owned server somewhere in the American Midwest.

      I had to set up a serverless VPC connector, reserve a static IP address, configure a NAT gateway, create a subnet, and then whitelist the IP
      address I reserved, but I kept getting an SSL error that said my project couldn't connect to my database. On a whim, I temporarily whitelisted
      all IP addresses, and my website was able to connect, which meant that I must've whitelisted the wrong IP address initially. Upon doing some
      digging in Google Cloud Console, I realized that GCP automatically allocated a cloud NAT IP and was routing traffic through it instead of the
      static IP I had reserved earlier. Upon updating my NAT gateway to use this static IP, I was able to get my website to connect to the database
      while removing the ability to connect to the database from all IP addresses (which would have been a huge security concern if I left it that
      way).
    </ProgressLogEntry>
  </div>
</template>

<script>
import Header from '../components/Header.vue';
import ProgressLogEntry from "../components/ProgressLogEntry.vue";
import Spoiler from "../components/Spoiler.vue";
import { useUserStore } from '../stores/userStore';

export default {
    name: 'ProgressLog',
    components: { 
      Header,
      ProgressLogEntry,
      Spoiler
    },
    data() {
      return {
        userStore: null
      };
    },
    created() {
      this.userStore = useUserStore();
    }
};
</script>

<style>
</style>