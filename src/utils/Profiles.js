/**
 * Profiles.js
 * 
 * Handles user authentication, profile creation, and profile management.
 * Functions are called from SplashScreen and CreateProfileScreen components.
 */

import { db } from "../db/db";

/**
 * ATTEMPT_LOGIN
 * 
 * Validates user credentials and loads the user's profile.
 * Called when user clicks "Login" button on SplashScreen.
 * 
 * @param {string} username - Username entered by user
 * @param {string} password - Password entered by user
 * @returns {Promise<{success: boolean, message: string, userId?: number, userData?: object}>}
 */
export async function ATTEMPT_LOGIN(username, password) {
  console.log(`ATTEMPT_LOGIN called with username: ${username}`);

  // Validate inputs
  if (!username || !username.trim()) {
    return {
      success: false,
      message: "Username is required.",
    };
  }

  if (!password || !password.trim()) {
    return {
      success: false,
      message: "Password is required.",
    };
  }

  try {
    // Note: Currently no Profiles table in database.
    // This function structure assumes a future Profiles/Users table with:
    // { id, username, email, passwordHash, createdAt, stats }
    
    // Placeholder implementation - would query database when Profiles table exists
    const user = await db.profiles
      ?.where("username")
      .equals(username.toLowerCase())
      .first()
      .catch(() => null);

    if (!user) {
      console.log(`Login failed: Username "${username}" not found.`);
      return {
        success: false,
        message: "Username or password is incorrect.",
      };
    }

    // Verify password (compare with stored hash in real implementation)
    // For now, placeholder logic
    const passwordMatch = await VERIFY_PASSWORD(password, user.passwordHash);

    if (!passwordMatch) {
      console.log(`Login failed: Incorrect password for username "${username}".`);
      return {
        success: false,
        message: "Username or password is incorrect.",
      };
    }

    // Load user's profile data
    const userData = {
      userId: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      stats: user.stats || { wins: 0, losses: 0, totalBattles: 0 },
    };

    console.log(`Login successful for user: ${username}`);

    return {
      success: true,
      message: "Login successful.",
      userId: user.id,
      userData,
    };
  } catch (error) {
    console.error("ATTEMPT_LOGIN error:", error);
    return {
      success: false,
      message: "An error occurred during login. Please try again.",
    };
  }
}

/**
 * CREATE_PROFILE
 * 
 * Creates a new user profile with the provided credentials.
 * Called when user clicks "Create Profile" button on CreateProfileScreen.
 * 
 * @param {string} username - Desired username
 * @param {string} email - User's email address
 * @param {string} password - Desired password
 * @returns {Promise<{success: boolean, message: string, userId?: number}>}
 */
export async function CREATE_PROFILE(username, email, password) {
  console.log(`CREATE_PROFILE called with username: ${username}, email: ${email}`);

  // Validate inputs
  const validation = VALIDATE_PROFILE_INPUTS(username, email, password);
  if (!validation.valid) {
    console.log(`Profile creation validation failed: ${validation.message}`);
    return {
      success: false,
      message: validation.message,
    };
  }

  try {
    // Check if username is already taken
    const usernameExists = await db.profiles
      ?.where("username")
      .equals(username.toLowerCase())
      .first()
      .catch(() => null);

    if (usernameExists) {
      console.log(`Profile creation failed: Username "${username}" already taken.`);
      return {
        success: false,
        message: "Username is already taken. Please choose a different username.",
      };
    }

    // Check if email is already registered (only if provided)
    if (email && email.trim()) {
      const emailExists = await db.profiles
        ?.where("email")
        .equals(email.toLowerCase())
        .first()
        .catch(() => null);

      if (emailExists) {
        console.log(`Profile creation failed: Email "${email}" already registered.`);
        return {
          success: false,
          message: "Email is already registered. Please use a different email.",
        };
      }
    }

    // Hash password
    const passwordHash = await HASH_PASSWORD(password);

    // Create new profile
    // Note: Requires Profiles table to exist with schema:
    // { ++id, &username, &email, passwordHash, createdAt, stats }
    const newProfileId = await db.profiles?.add({
      username: username.toLowerCase(),
      email: email ? email.toLowerCase() : "",
      passwordHash,
      createdAt: new Date().toISOString(),
      stats: {
        wins: 0,
        losses: 0,
        totalBattles: 0,
      },
    });

    console.log(`Profile created successfully for username: ${username} with ID: ${newProfileId}`);

    return {
      success: true,
      message: "Profile created successfully! You can now log in.",
      userId: newProfileId,
    };
  } catch (error) {
    console.error("CREATE_PROFILE error:", error);
    return {
      success: false,
      message: "An error occurred while creating your profile. Please try again.",
    };
  }
}

/**
 * VALIDATE_PROFILE_INPUTS
 * 
 * Validates username, email, and password format and strength.
 * 
 * @param {string} username - Username to validate
 * @param {string} email - Email to validate
 * @param {string} password - Password to validate
 * @returns {object} {valid: boolean, message: string}
 */
function VALIDATE_PROFILE_INPUTS(username, email, password) {
  // Validate username
  if (!username || !username.trim()) {
    return { valid: false, message: "Username is required." };
  }

  if (username.length < 3) {
    return { valid: false, message: "Username must be at least 3 characters long." };
  }

  if (username.length > 20) {
    return { valid: false, message: "Username must not exceed 20 characters." };
  }

  // Only alphanumeric and underscores allowed
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { valid: false, message: "Username can only contain letters, numbers, and underscores." };
  }

  // Validate email if provided
  if (email && email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, message: "Please enter a valid email address." };
    }
  }

  // Validate password
  if (!password || !password.trim()) {
    return { valid: false, message: "Password is required." };
  }

  if (password.length < 6) {
    return { valid: false, message: "Password must be at least 6 characters long." };
  }

  if (password.length > 50) {
    return { valid: false, message: "Password must not exceed 50 characters." };
  }

  return { valid: true, message: "All inputs are valid." };
}

/**
 * HASH_PASSWORD
 * 
 * Hashes a password using a simple algorithm (placeholder).
 * In production, use bcrypt or similar library.
 * 
 * @param {string} password - Plain text password to hash
 * @returns {Promise<string>} - Hashed password
 */
async function HASH_PASSWORD(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

/**
 * VERIFY_PASSWORD
 *
 * Verifies a plain text password against a stored SHA-256 hash.
 */
async function VERIFY_PASSWORD(plainPassword, hash) {
  try {
    const computedHash = await HASH_PASSWORD(plainPassword);
    return computedHash === hash;
  } catch {
    return false;
  }
}

/**
 * LOAD_PROFILE
 * 
 * Loads an existing user profile by ID.
 * 
 * @param {number} userId - User ID to load
 * @returns {Promise<{success: boolean, userData?: object, message?: string}>}
 */
export async function LOAD_PROFILE(userId) {
  console.log(`LOAD_PROFILE called with userId: ${userId}`);

  try {
    const user = await db.profiles?.get(userId);

    if (!user) {
      return {
        success: false,
        message: "Profile not found.",
      };
    }

    const userData = {
      userId: user.id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
      stats: user.stats || { wins: 0, losses: 0, totalBattles: 0 },
    };

    console.log(`Profile loaded for userId: ${userId}`);

    return {
      success: true,
      userData,
    };
  } catch (error) {
    console.error("LOAD_PROFILE error:", error);
    return {
      success: false,
      message: "An error occurred while loading the profile.",
    };
  }
}

/**
 * GET_USER_STATS
 * 
 * Retrieves combat statistics for a user.
 * 
 * @param {number} userId - User ID
 * @returns {Promise<{success: boolean, stats?: object, message?: string}>}
 */
export async function GET_USER_STATS(userId) {
  console.log(`GET_USER_STATS called for userId: ${userId}`);

  try {
    const user = await db.profiles?.get(userId);

    if (!user) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    return {
      success: true,
      stats: user.stats || { wins: 0, losses: 0, totalBattles: 0 },
    };
  } catch (error) {
    console.error("GET_USER_STATS error:", error);
    return {
      success: false,
      message: "An error occurred while retrieving user statistics.",
    };
  }
}

/**
 * UPDATE_USER_STATS
 * 
 * Updates user combat statistics after a battle.
 * 
 * @param {number} userId - User ID
 * @param {number} wins - Number of wins to add
 * @param {number} losses - Number of losses to add
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function UPDATE_USER_STATS(userId, wins = 0, losses = 0) {
  console.log(`UPDATE_USER_STATS called for userId: ${userId}, wins: ${wins}, losses: ${losses}`);

  try {
    const user = await db.profiles?.get(userId);

    if (!user) {
      return {
        success: false,
        message: "User not found.",
      };
    }

    const updatedStats = {
      wins: (user.stats?.wins || 0) + wins,
      losses: (user.stats?.losses || 0) + losses,
      totalBattles: (user.stats?.totalBattles || 0) + wins + losses,
    };

    await db.profiles?.update(userId, {
      stats: updatedStats,
    });

    console.log(`Stats updated for userId: ${userId}`);

    return {
      success: true,
      message: "Statistics updated successfully.",
    };
  } catch (error) {
    console.error("UPDATE_USER_STATS error:", error);
    return {
      success: false,
      message: "An error occurred while updating statistics.",
    };
  }
}
