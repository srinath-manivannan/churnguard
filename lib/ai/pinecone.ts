/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// PINECONE VECTOR DATABASE INTEGRATION
// ============================================
// This file handles vector storage and semantic search
// Used for: chatbot context retrieval, similar customer finding

import { Pinecone } from "@pinecone-database/pinecone";

// ============================================
// INITIALIZE PINECONE CLIENT
// ============================================
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

// Get index reference
const indexName = process.env.PINECONE_INDEX_NAME || "churn-customers";
export const index = pinecone.index(indexName);

// ============================================
// UPSERT CUSTOMER VECTOR
// ============================================
// Stores customer data as a vector in Pinecone
export async function upsertCustomerVector(
  customerId: string,
  userId: string,
  embedding: number[],
  metadata: {
    name: string;
    email?: string;
    segment?: string;
    churnScore?: number;
    riskLevel?: string;
  }
) {
  try {
    // Create namespace for this user (isolates data between users)
    const namespace = index.namespace(`user_${userId}`);

    // Upsert vector
    await namespace.upsert([
      {
        id: customerId,
        values: embedding,
        metadata: {
          ...metadata,
          userId, // Store userId in metadata for filtering
        },
      },
    ]);

    return { success: true };
  } catch (error) {
    console.error("Pinecone upsert error:", error);
    throw new Error("Failed to store customer vector");
  }
}

// ============================================
// BATCH UPSERT CUSTOMER VECTORS
// ============================================
// Stores multiple customer vectors at once (more efficient)
export async function upsertCustomerVectorsBatch(
  userId: string,
  vectors: Array<{
    id: string;
    values: number[];
    metadata: any;
  }>
) {
  try {
    // Create namespace for this user
    const namespace = index.namespace(`user_${userId}`);

    // Add userId to all metadata
    const vectorsWithUserId = vectors.map((vec) => ({
      ...vec,
      metadata: {
        ...vec.metadata,
        userId,
      },
    }));

    // Upsert in batches of 100 (Pinecone limit)
    const batchSize = 100;
    for (let i = 0; i < vectorsWithUserId.length; i += batchSize) {
      const batch = vectorsWithUserId.slice(i, i + batchSize);
      await namespace.upsert(batch);

      // Small delay between batches
      if (i + batchSize < vectorsWithUserId.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return { success: true, count: vectorsWithUserId.length };
  } catch (error) {
    console.error("Pinecone batch upsert error:", error);
    throw new Error("Failed to store customer vectors batch");
  }
}

// ============================================
// SEMANTIC SEARCH
// ============================================
// Searches for similar customers based on query text
export async function searchSimilarCustomers(
  userId: string,
  queryEmbedding: number[],
  topK: number = 5,
  filter?: any
) {
  try {
    // Create namespace for this user
    const namespace = index.namespace(`user_${userId}`);

    // Build filter (always include userId)
    const finalFilter = {
      userId: { $eq: userId },
      ...filter,
    };

    // Query vectors
    const queryResponse = await namespace.query({
      vector: queryEmbedding,
      topK: topK,
      includeMetadata: true,
      filter: finalFilter,
    });

    // Return matches with scores
    return queryResponse.matches.map((match) => ({
      id: match.id,
      score: match.score,
      metadata: match.metadata,
    }));
  } catch (error) {
    console.error("Pinecone search error:", error);
    throw new Error("Failed to search similar customers");
  }
}

// ============================================
// SEARCH BY CUSTOMER NAME
// ============================================
// Finds customers by name using metadata filtering
export async function searchCustomersByName(
  userId: string,
  queryEmbedding: number[],
  nameQuery: string,
  topK: number = 5
) {
  try {
    // Create namespace for this user
    const namespace = index.namespace(`user_${userId}`);

    // Query with name filter
    const queryResponse = await namespace.query({
      vector: queryEmbedding,
      topK: topK * 2, // Get more results to filter by name
      includeMetadata: true,
      filter: {
        userId: { $eq: userId },
      },
    });

    // Filter results by name match (case-insensitive)
    const nameQueryLower = nameQuery.toLowerCase();
    const filtered = queryResponse.matches
      .filter((match) => {
        const name = (match.metadata?.name as string)?.toLowerCase() || "";
        return name.includes(nameQueryLower);
      })
      .slice(0, topK);

    return filtered.map((match) => ({
      id: match.id,
      score: match.score,
      metadata: match.metadata,
    }));
  } catch (error) {
    console.error("Pinecone name search error:", error);
    throw new Error("Failed to search customers by name");
  }
}

// ============================================
// DELETE CUSTOMER VECTOR
// ============================================
// Removes customer from vector database
export async function deleteCustomerVector(
  userId: string,
  customerId: string
) {
  try {
    // Create namespace for this user
    const namespace = index.namespace(`user_${userId}`);

    // Delete vector by ID
    await namespace.deleteOne(customerId);

    return { success: true };
  } catch (error) {
    console.error("Pinecone delete error:", error);
    throw new Error("Failed to delete customer vector");
  }
}

// ============================================
// DELETE ALL USER VECTORS
// ============================================
// Removes all vectors for a user (useful when user deletes account)
export async function deleteAllUserVectors(userId: string) {
  try {
    // Create namespace for this user
    const namespace = index.namespace(`user_${userId}`);

    // Delete all vectors in namespace
    await namespace.deleteAll();

    return { success: true };
  } catch (error) {
    console.error("Pinecone delete all error:", error);
    throw new Error("Failed to delete all user vectors");
  }
}

// ============================================
// GET VECTOR STATS
// ============================================
// Gets statistics about stored vectors for a user
export async function getUserVectorStats(userId: string) {
  try {
    // Get index stats
    const stats = await index.describeIndexStats();

    // Get namespace stats (if available)
    const namespaceKey = `user_${userId}`;
    const namespaceStats = stats.namespaces?.[namespaceKey];

    return {
      totalVectors: namespaceStats?.recordCount || 0,
      dimension: stats.dimension,
      indexFullness: stats.indexFullness,
    };
  } catch (error) {
    console.error("Pinecone stats error:", error);
    return {
      totalVectors: 0,
      dimension: 768,
      indexFullness: 0,
    };
  }
}