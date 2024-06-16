# Clicker.io - Web3 Based Game

Welcome to **Clicker.io**, a Web3-based game developed by Nalikes Studio for assessment purposes. This README will guide you through the setup, configuration, and deployment of the project.

## Table of Contents
1. [Project Description](#project-description)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Requirements](#requirements)
5. [Installation](#installation)
6. [Configuration](#configuration)
7. [Running the Project](#running-the-project)

## Project Description

**Clicker.io** is a web-based game where players compete to see who can click the fastest in one minute. The fastest player is rewarded with 1000 tokens. The game leverages the BuildBear sandbox network to manage token transactions. All players and the reward sender should be on the BuildBear network.

## Tech Stack

- **Backend**: Express, Node.js, Mongoose
- **Frontend**: React
- **Real-time Communication**: Socket.io
- **Blockchain**: BuildBear Sandbox Network

## Features

- User Authentication
- Real-time multiplayer gameplay
- Token rewards for the fastest player
- Secure and decentralized transactions using the BuildBear sandbox network

## Requirements

- Node.js (v20.x or later)
- npm
- A MongoDB Server
- A wallet on the BuildBear sandbox network

## Installation

1. **Clone the repository**

    ```bash
    git clone https://github.com/yourusername/clicker.io.git
    cd clicker.io
    ```

2. **Install dependencies**

    ```bash
    npm install
    ```

## Configuration

Create a `.env` file in the root directory of the project and add the following environment variables:

- `SIGNER_PRIVATE_KEY`: Private key of the wallet that will send the reward tokens.
- `RPC_URL`: RPC URL of the BuildBear sandbox network.
- `SECRET_KEY`: Secret key for JWT authentication.
- `MONGO_URL`: URL of your MongoDB database

## Running the Project

1. **Start the server**

    ```bash
    node .
    ```

    The server will start on `http://localhost:4000`.

2. **Open your browser and navigate to**

    ```
    http://localhost:4000
    ```

    You should see the Clicker.io game interface.