// src/userModel.js

class UserModel {
    constructor() {
        // Simulated database using an array
        this.users = [];
    }

    // Method to add a new user
    addUser(username, email, password) {
        // Check if the user already exists
        const existingUser = this.users.find(user => user.username === 
username);
        if (existingUser) {
            throw new Error('User already exists');
        }

        // Add new user to the simulated database
        const newUser = { username, email, password };
        this.users.push(newUser);
        return newUser;
    }

    // Method to retrieve a user by username
    getUserByUsername(username) {
        return this.users.find(user => user.username === username);
    }
}

module.exports = new UserModel();

