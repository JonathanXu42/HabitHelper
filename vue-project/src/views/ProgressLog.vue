<template>
  <div class="progressLog">
    <Header></Header>
    <h1>Progress Log</h1>

    <p>July 3rd, 2025</p>

    <p>
    I've decided to build a habit streak website to add to my resume. I'm using Javascript for the entire tech
    stack – Vue.js for the frontend and Node.js for the backend. For the database, I'm going to use a MongoDB
    NoSQL database since this is going to be a write-heavy application where users are constantly adding,
    deleting, and editing the habits they want to keep track of. NoSQL databases usually have better write
    performance than relational databases, and I've always wanted to try out MongoDB.
    </p>

    <p>
    In this first update, I've initialized a Vue.js frontend that runs on localhost port 5173 and a Node.js
    frontend that runs on localhost port 3000. I installed the concurrently package so that the frontend and
    backend will fire up at the same time when I run "npm run dev." I'm also using the nodemon package so that
    my Node.js backend will restart automatically when I make changes to it.
    </p>

    <p>
    So far I have four webpages in my website: a login screen where users can also create an account, a landing
    page after the user logs in successfully, a forgot password page that the user can access from the login
    screen, and of course, this progress log page.
    </p>

    <p>
    I don't have a database yet to store users and passwords, so currently the login screen accepts any
    combination of a validly formatted email address and any password. What I'm most proud of in this update is
    the forgot password page, where the user enters their email and gets sent a random 6 digit verification code.
    This is the first time that I've ever implemented automated emails within an application, and it was quite the
    learning experience.
    </p>

    <p>
    I went with Nodemailer since that's the most popular Node.js package for sending emails, and I created two APIs:
    one for sending verification codes, and one for sending notification emails to help users stay on track with their
    habits. I created a new gmail account, habithelper247@gmail.com, to send outbound emails (habithelper@gmail.com 
    was already taken, so I appended 24/7 at the end – yay toxic productivity!)
    </p>

    <p>
    It turns out that for security reasons, after 2022 Google stopped allowing apps like mine to log into someone's email
    account with just their username and password, and start sending emails. Now, I have to use OAuth2 authentication –
    specifically 3 legged OAuth authentication (3LO) – which a clientId (public identifier for my app), a clientSecret
    (code known only to me and Google), and a refreshToken (long-lived token used to obtain access tokens). In order to
    obtain all of these, I was required to create a project on Google's Cloud Console, enable Gmail API, and jump through
    a couple more hoops. These secrets I will be storing in my .env file, which I will not be committing to Github. 
    </p>

    <p>July 4th, 2025</p>

    <p>
    I've created a header/navbar component that will end up being used on the majority of the pages in this website,
    including this one. I've also created a custom 404 resource not found error page that'll appear in the event that a 
    user types in the name of a page that doesn't exist.
    </p>

    <p>
    I decided to try allowing users to sign in using 3rd party email providers. For the time being, I'm only going to
    support Google accounts/Gmail, since I already did much of the legwork when I set up the Gmail API. I installed the
    frontend library vue3-google-login and the backend library google-auth-library.
    </p>

    <p>
    One day later...
    </p>

    <p>
    Well, that was an awful experience. I wanted to reuse the clientID and clientSecret that I generated on Google's
    Cloud Console when I was implementing the Gmail API, since this login feature is a core part of OAuth2 authentication
    and in theory I wouldn't have to enable any additional APIs to get it working. 
    </p>

    <p>
    This was the first issue I ran into: "Uncaught (in promise) Error: Prop client id required since plugin is not 
    initialized with a client id". That basically means that the Google Login plugin I imported from the vue3-google-login
    library couldn't figure out what my clientID was. I double-checked the filepath to my .env file, appended VITE_ to the 
    beginning of my clientID name so that Vite could automatically load it and I wouldn't have to manually resolve filepaths,
    I tried importing the clientID in main.js so that my Vue files would have access to it, and I even tried clearing
    Vite's cache.
    </p>

    <p>
    In the end, the issue was that I was using a named import in main.js instead of a default import. More confusingly,
    I was supposed to use a default import in main.js to set up the plugin, and then a named import in Login.vue to import
    the GoogleLogin component.
    </p>

    <p>
    After resolving this issue, I got a 403 error upon loading the login page, with the GSI logger stating in the console that
    "The given origin is not allowed for the given client ID". I figured out pretty quickly that this meant that I didn't
    authorize the correct Javascript origins in Google Cloud Console, preventing Google Login plugin from executing. I checked
    to make sure that I was using http when accessing my project in my localhost instead of https, and I thought for sure that
    authorizing "http://localhost:5173" (the port number of my Vue.js frontend) as a Javascript origin would be enough, but for 
    some reason, I had to also authorize "http://localhost" (without the port number).
    </p>

    <p>
    The third major bug I encountered was by far the worse and it led me to abandon using vue3-google-login entirely and
    switch to using passport.js. The GoogleLogin button in my Login.vue file was supposed to call one of two functions depending
    on whether the login was successful: onGoogleSuccess() and onGoogleError(). No matter what I did, it wouldn't call either
    function. I tried creating my own custom button with the GoogleLogin component as a wrapper, but that didn't help. I tried
    adding and removing quotes around the function calls, thinking the component might not recognize the function names, but to
    no avail. I thought maybe my version of vue3-google-login was outdated, but version 2.0.33 is the latest stable version.
    </p>

    In the end, I switched to passport.js, which relies much more on the backend in comparison to vue3-google-login. I got it
    working in almost no time at all and didn't encounter any significant bugs, although the resulting code is longer and more
    complex than what I would've ended up with if vue3-google-login had worked.

    <p>July 5th, 2025</p>

    <p>
    Today I set up a MongoDB database and Prisma as an ORM. I'm using a NoSQL database because they usually offer better performance
    than SQL databases for write-heavy applications, and I expect most active users of this website to be making writes everyday,
    sometimes multiple times a day, whether it's adding, updating, or deleting a habit. MongoDB is the most popular NoSQL database
    and it's something I've always wanted to learn. I know Mongoose is the most popular ORM for MongoDB, and that it offers certain
    advanced features that Prisma doesn't offer, but I think it makes more sense to double down on Prisma for the sake of my resume,
    since I've used it before.
    </p>

    <p>
    I'm using MongoDB Atlas to store my database in the cloud, so I won't have to worry about storing it on my localhost or in my
    Github repository. Storing my database in the cloud will offer a more seamless transition when I deploy the rest of my project to
    the cloud, plus Atlas offers a free tier that'll be more than enough for my needs in development. My prisma schema and all migration 
    files will reside in a prisma folder, inside my server directory where I'm keeping all my backend files, including my Node.js files.
    </p>

    <p>
    My Prisma schema is as follows: every User has an ID, a first name, a last name, an email, and a timezone. Users who log in using an
    email and password combo will have a password, while users who log in with Gmail or another email provider won't have a password.
    In the future, I want to support text notifications and add a phone number to the User schema, but right now I want to focus on email
    notifications.
    </p>

    <p>
    Users can have between 0 and many Habits, and each Habit has a UserID representing what User it's tied to. Habits have names, a longest
    streak integer, a current streak integer, an array that contains the days of the week when the user wants to work on the habit, a goal
    (which can be numeric or boolean), and email reminder settings where the user can determine if they'd like to be reminded about their
    habits, and what times of day they'd like to be reminded.
    </p>

    Each Habit has between 0 and many HabitLogs, and each HabitLog has a UserID and a HabitID indicating what User and Habit they're tied to.
    HabitLogs are a way for users to write daily notes about their habits. 
  </div>
</template>

<script>
import Header from '../components/Header.vue';

export default {
    name: 'ProgressLog',
    components: { 
      Header 
    }
};
</script>
<style>
</style>