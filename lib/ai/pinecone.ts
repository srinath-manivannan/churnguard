/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pinecone } from "@pinecone-database/pinecone";

let _pinecone: Pinecone | null = null;

function getPinecone() {
  if (!_pinecone) {
    const apiKey = process.env.PINECONE_API_KEY;
    if (!apiKey) {
      throw new Error(
        "PINECONE_API_KEY is not set. Pinecone features are unavailable."
      );
    }
    _pinecone = new Pinecone({ apiKey });
  }
  return _pinecone;
}

function getIndex() {
  const indexName = process.env.PINECONE_INDEX_NAME || "churn-customers";
  return getPinecone().index(indexName);
}

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
  const namespace = getIndex().namespace(`user_${userId}`);

  await namespace.upsert([
    {
      id: customerId,
      values: embedding,
      metadata: { ...metadata, userId },
    },
  ]);

  return { success: true };
}

const PINECONE_BATCH_SIZE = 100;

export async function upsertCustomerVectorsBatch(
  userId: string,
  vectors: Array<{ id: string; values: number[]; metadata: any }>
) {
  const namespace = getIndex().namespace(`user_${userId}`);

  const withUserId = vectors.map((vec) => ({
    ...vec,
    metadata: { ...vec.metadata, userId },
  }));

  for (let i = 0; i < withUserId.length; i += PINECONE_BATCH_SIZE) {
    const batch = withUserId.slice(i, i + PINECONE_BATCH_SIZE);
    await namespace.upsert(batch);

    if (i + PINECONE_BATCH_SIZE < withUserId.length) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  return { success: true, count: withUserId.length };
}

export async function searchSimilarCustomers(
  userId: string,
  queryEmbedding: number[],
  topK: number = 5,
  filter?: any
) {
  const namespace = getIndex().namespace(`user_${userId}`);

  const queryResponse = await namespace.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
    filter: { userId: { $eq: userId }, ...filter },
  });

  return queryResponse.matches.map((match) => ({
    id: match.id,
    score: match.score,
    metadata: match.metadata,
  }));
}

export async function searchCustomersByName(
  userId: string,
  queryEmbedding: number[],
  nameQuery: string,
  topK: number = 5
) {
  const namespace = getIndex().namespace(`user_${userId}`);

  const queryResponse = await namespace.query({
    vector: queryEmbedding,
    topK: topK * 2,
    includeMetadata: true,
    filter: { userId: { $eq: userId } },
  });

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
}

export async function deleteCustomerVector(userId: string, customerId: string) {
  const namespace = getIndex().namespace(`user_${userId}`);
  await namespace.deleteOne(customerId);
  return { success: true };
}

export async function deleteAllUserVectors(userId: string) {
  const namespace = getIndex().namespace(`user_${userId}`);
  await namespace.deleteAll();
  return { success: true };
}

export async function getUserVectorStats(userId: string) {
  try {
    const stats = await getIndex().describeIndexStats();
    const namespaceStats = stats.namespaces?.[`user_${userId}`];

    return {
      totalVectors: namespaceStats?.recordCount || 0,
      dimension: stats.dimension,
      indexFullness: stats.indexFullness,
    };
  } catch {
    return { totalVectors: 0, dimension: 768, indexFullness: 0 };
  }
}
