# Google Meet Clone

A simple video call web application which allows users to video chat. Right now it is only peer to peer(only 2 people can chat with each other).

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Installation](#installation)
- [Usage](#usage)
- [Demo](#demo)

## Features

1. There is a user authentication system which allows users to signup and login.
2. A user can share their unique meeting code/room code to any other user which allows them to join a room and then have a video chat.
3. It allows only peer to peer communication.

## Technologies

1. Frontend(client side) is implemented using React.JS and tailwindcss.
2. Backend(server side) is implemented using Node.JS and Express.js.
3. User authentication system is implemented using JWT.
4. MongoDB is used as a database storing users' data.
5. Video chat is implemented using WebRTC.
6. Socket.IO is used for sharing the offers and answers.
7. Some free STUN servers are used for making offers and answers.

## Installation

1. Clone the repository: `git clone https://github.com/AdoshSingh/meet_clone_pub.git` run this in terminal.
2. Install the dependencies: `npm install` run this in client as well as in the server folder, it will install the dependencies required in the project.
3. There are some env variables also like:
   - `MONGODB_CONNECTION_URL`: put your local mongo db connection uri.
   - `SECRET_KEY`: put anything it is used for generating token for authentication.
   - `EMAIL_ADDRESS`: used to send email to the user from this email about instruction about how to reset password if you forgot it.
   - `EMAIL_PASSWORD`: this is app password for the above email address, just google it how to obtain it.
4. Run the project: first run `nodemon index` in the `/server` and then run `npm run start` in the `/client`.

## Usage

1. Signup and make an account by filling out the details.
2. Login to your account.
3. Generate the meeting code(click the generate meeting code button).
4. Enter this code below in the input field and share it with whom you want to connect.
5. Join the room, ask the other user to join the room.
6. You will get the option to call that user, call them.
7. They will have to accept the call.
8. Enjoy the video chat.

## Demo

Delployed Link - [https://meet-clone-client.onrender.com/](https://meet-clone-client.onrender.com/)
