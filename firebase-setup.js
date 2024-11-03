// firebase-setup.js
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, update, query, orderByChild } from 'firebase/database';

const BATCH_SIZE = 500; // Number of posts to process at once

// Initialize your Firebase app here
const firebaseConfig = {
  // Your Firebase config object
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Utility function to calculate relevancy score
const calculateRelevancyScore = (post) => {
  const now = Date.now();
  const postAge = (now - post.createdAt) / (1000 * 60 * 60);
  const likes = post.likes || 0;
  
  return (1 / Math.pow(postAge + 2, 1)) * Math.pow(likes + 1, 2);
};

// Migration script to add relevancy scores to existing posts
async function migratePostsToIncludeRelevancyScores() {
  console.log('Starting posts migration...');
  
  try {
    // Get all posts without pagination first
    const postsRef = ref(database, 'posts');
    const postsQuery = query(postsRef, orderByChild('createdAt'));
    
    const snapshot = await get(postsQuery);
    if (!snapshot.exists()) {
      console.log('No posts found to migrate');
      return;
    }

    const posts = [];
    snapshot.forEach((childSnapshot) => {
      posts.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });

    console.log(`Found ${posts.length} posts to process`);

    // Process posts in batches
    for (let i = 0; i < posts.length; i += BATCH_SIZE) {
      const batch = posts.slice(i, i + BATCH_SIZE);
      const updates = {};

      batch.forEach((post) => {
        const score = calculateRelevancyScore(post);
        updates[`posts/${post.id}/relevancyScore`] = score;
      });

      // Apply batch updates
      await update(ref(database), updates);
      console.log(`Processed batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(posts.length / BATCH_SIZE)}`);
    }

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Function to create required Firebase indexes
async function createRequiredIndexes() {
  console.log(`
To create the required indexes, go to the Firebase Console and add the following indexes:

1. Realtime Database Index:
   - Path: /posts
   - Child: relevancyScore
   - Order: .desc

Note: You cannot create indexes programmatically. You need to add them manually in the Firebase Console.
  `);
}

// Function to update security rules
async function updateSecurityRules() {
  console.log(`
Update your Firebase Realtime Database security rules to include relevancyScore:

{
  "rules": {
    "posts": {
      "$postId": {
        ".read": true,
        ".write": "auth != null",
        "relevancyScore": {
          ".validate": "newData.isNumber()"
        },
        "likes": {
          ".validate": "newData.isNumber()"
        },
        "likedBy": {
          ".validate": "newData.hasChildren()"
        },
        "createdAt": {
          ".validate": "newData.isNumber()"
        }
      }
    }
  }
}
  `);
}

// Main setup function
export async function setupRelevancySystem() {
  try {
    // 1. Show index requirements
    await createRequiredIndexes();
    
    // 2. Show security rules
    await updateSecurityRules();
    
    // 3. Run migration
    const proceed = confirm(
      'This will update all existing posts to include relevancy scores. ' +
      'Make sure you have backed up your database before proceeding. Continue?'
    );
    
    if (proceed) {
      await migratePostsToIncludeRelevancyScores();
      console.log('\nSetup completed successfully!');
    } else {
      console.log('Setup cancelled');
    }
    
  } catch (error) {
    console.error('Setup failed:', error);
    throw error;
  }
}

// Usage example
if (require.main === module) {
  setupRelevancySystem()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}