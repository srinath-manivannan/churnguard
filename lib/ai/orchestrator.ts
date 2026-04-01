/* eslint-disable @typescript-eslint/no-explicit-any */
import { logger } from "@/lib/observability/logger";

export interface AIProviderConfig {
  name: string;
  priority: number;
  enabled: boolean;
  maxRetries: number;
  timeoutMs: number;
  handler: (...args: any[]) => Promise<any>;
}

interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  state: "closed" | "open" | "half-open";
  successCount: number;
}

interface AICallMetrics {
  provider: string;
  operation: string;
  latencyMs: number;
  success: boolean;
  error?: string;
  timestamp: number;
  retryCount: number;
}

const CIRCUIT_BREAKER_THRESHOLD = 3;
const CIRCUIT_BREAKER_RESET_MS = 5 * 60 * 1000;
const HALF_OPEN_SUCCESS_THRESHOLD = 2;

const circuitBreakers = new Map<string, CircuitBreakerState>();
const metricsBuffer: AICallMetrics[] = [];
const MAX_METRICS_BUFFER = 1000;

function getCircuitBreaker(provider: string): CircuitBreakerState {
  if (!circuitBreakers.has(provider)) {
    circuitBreakers.set(provider, {
      failures: 0,
      lastFailure: 0,
      state: "closed",
      successCount: 0,
    });
  }
  return circuitBreakers.get(provider)!;
}

function shouldAllowRequest(provider: string): boolean {
  const cb = getCircuitBreaker(provider);

  if (cb.state === "closed") return true;

  if (cb.state === "open") {
    if (Date.now() - cb.lastFailure >= CIRCUIT_BREAKER_RESET_MS) {
      cb.state = "half-open";
      cb.successCount = 0;
      logger.info(`Circuit breaker half-open for ${provider}`);
      return true;
    }
    return false;
  }

  // half-open: allow limited requests
  return true;
}

function recordSuccess(provider: string) {
  const cb = getCircuitBreaker(provider);
  if (cb.state === "half-open") {
    cb.successCount++;
    if (cb.successCount >= HALF_OPEN_SUCCESS_THRESHOLD) {
      cb.state = "closed";
      cb.failures = 0;
      logger.info(`Circuit breaker closed for ${provider} after recovery`);
    }
  } else {
    cb.failures = 0;
  }
}

function recordFailure(provider: string) {
  const cb = getCircuitBreaker(provider);
  cb.failures++;
  cb.lastFailure = Date.now();

  if (cb.state === "half-open") {
    cb.state = "open";
    logger.warn(`Circuit breaker re-opened for ${provider}`);
  } else if (cb.failures >= CIRCUIT_BREAKER_THRESHOLD) {
    cb.state = "open";
    logger.warn(`Circuit breaker opened for ${provider} after ${cb.failures} failures`);
  }
}

function trackMetrics(metrics: AICallMetrics) {
  metricsBuffer.push(metrics);
  if (metricsBuffer.length > MAX_METRICS_BUFFER) {
    metricsBuffer.splice(0, metricsBuffer.length - MAX_METRICS_BUFFER);
  }
}

async function executeWithRetry(
  provider: AIProviderConfig,
  operation: string,
  args: any[]
): Promise<any> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= provider.maxRetries; attempt++) {
    const startTime = Date.now();

    try {
      const result = await Promise.race([
        provider.handler(...args),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout after ${provider.timeoutMs}ms`)), provider.timeoutMs)
        ),
      ]);

      const latencyMs = Date.now() - startTime;
      recordSuccess(provider.name);
      trackMetrics({
        provider: provider.name,
        operation,
        latencyMs,
        success: true,
        timestamp: Date.now(),
        retryCount: attempt,
      });

      logger.debug(`${provider.name}.${operation} completed in ${latencyMs}ms (attempt ${attempt + 1})`);
      return result;
    } catch (error: any) {
      lastError = error;
      const latencyMs = Date.now() - startTime;

      trackMetrics({
        provider: provider.name,
        operation,
        latencyMs,
        success: false,
        error: error.message,
        timestamp: Date.now(),
        retryCount: attempt,
      });

      const isRetryable = !error.message?.includes("Invalid API") &&
        !error.message?.includes("not set") &&
        !error.message?.includes("401");

      if (!isRetryable || attempt === provider.maxRetries) {
        recordFailure(provider.name);
        break;
      }

      // Exponential backoff: 1s, 2s, 4s
      const backoffMs = Math.min(1000 * Math.pow(2, attempt), 8000);
      logger.debug(`${provider.name}.${operation} retry ${attempt + 1} in ${backoffMs}ms`);
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }

  throw lastError || new Error(`${provider.name} failed`);
}

/**
 * Execute an AI operation with automatic failover across prioritized providers.
 * Implements circuit-breaker pattern, retry with exponential backoff,
 * latency tracking, and structured fallback chains.
 */
export async function orchestrate<T>(
  operation: string,
  providers: AIProviderConfig[],
  fallback?: () => T
): Promise<T> {
  const sorted = providers
    .filter((p) => p.enabled)
    .sort((a, b) => a.priority - b.priority);

  const errors: Array<{ provider: string; error: string }> = [];

  for (const provider of sorted) {
    if (!shouldAllowRequest(provider.name)) {
      logger.debug(`Skipping ${provider.name} — circuit breaker open`);
      continue;
    }

    try {
      return await executeWithRetry(provider, operation, []);
    } catch (error: any) {
      errors.push({ provider: provider.name, error: error.message });
      logger.warn(`${provider.name}.${operation} failed: ${error.message}`);
    }
  }

  if (fallback) {
    logger.info(`All AI providers failed for ${operation}, using fallback`);
    return fallback();
  }

  logger.error(`All AI providers failed for ${operation}`, { errors });
  throw new Error(`All AI providers failed for ${operation}: ${errors.map((e) => `${e.provider}: ${e.error}`).join("; ")}`);
}

export function getAIMetrics() {
  const now = Date.now();
  const last5min = metricsBuffer.filter((m) => now - m.timestamp < 5 * 60 * 1000);
  const last1hr = metricsBuffer.filter((m) => now - m.timestamp < 60 * 60 * 1000);

  const byProvider = (metrics: AICallMetrics[]) => {
    const grouped: Record<string, { total: number; successes: number; avgLatency: number; p95Latency: number }> = {};

    for (const m of metrics) {
      if (!grouped[m.provider]) {
        grouped[m.provider] = { total: 0, successes: 0, avgLatency: 0, p95Latency: 0 };
      }
      grouped[m.provider].total++;
      if (m.success) grouped[m.provider].successes++;
    }

    for (const [provider, stats] of Object.entries(grouped)) {
      const latencies = metrics
        .filter((m) => m.provider === provider && m.success)
        .map((m) => m.latencyMs)
        .sort((a, b) => a - b);

      stats.avgLatency = latencies.length > 0
        ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
        : 0;
      stats.p95Latency = latencies.length > 0
        ? latencies[Math.floor(latencies.length * 0.95)] || latencies[latencies.length - 1]
        : 0;
    }

    return grouped;
  };

  return {
    last5min: byProvider(last5min),
    last1hr: byProvider(last1hr),
    circuitBreakers: Object.fromEntries(
      Array.from(circuitBreakers.entries()).map(([k, v]) => [k, { state: v.state, failures: v.failures }])
    ),
  };
}
