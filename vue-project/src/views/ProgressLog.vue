<template>
  <div class="progressLog">
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
  </div>
</template>

<script>
export default {
    name: 'ProgressLog'
};
</script>
<style>
</style>