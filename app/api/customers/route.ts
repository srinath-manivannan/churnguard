/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// CUSTOMERS API - LIST & CREATE
// ============================================
// GET /api/customers - Get all customers
// POST /api/customers - Create new customer

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getCustomers, createCustomer } from "@/lib/db/queries";
import { createCustomerEmbedding } from "@/lib/ai/embeddings";
import { upsertCustomerVector } from "@/lib/ai/pinecone";

// ============================================
// GET - List all customers
// ============================================
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const riskLevel = searchParams.get("riskLevel");
    const search = searchParams.get("search");

    // Get customers from database
    let customersList = await getCustomers(user.id);

    // Apply filters if provided
    if (riskLevel) {
      customersList = customersList.filter(
        (c) => c.riskLevel === riskLevel
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      customersList = customersList.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.email?.toLowerCase().includes(searchLower)
      );
    }

    // Return customers
    return NextResponse.json({
      success: true,
      customers: customersList,
      count: customersList.length,
    });
  } catch (error: any) {
    console.error("Get customers error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get customers" },
      { status: error.message === "Unauthorized - Please sign in" ? 401 : 500 }
    );
  }
}

// ============================================
// POST - Create new customer
// ============================================
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Parse request body
    const body = await request.json();
    const {
      name,
      email,
      phone,
      company,
      segment,
      lastActivityDate,
      totalRevenue,
      supportTickets,
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: "Customer name is required" },
        { status: 400 }
      );
    }

    // Create customer in database
    const customerId = await createCustomer({
      userId: user.id,
      name,
      email: email || null,
      phone: phone || null,
      company: company || null,
      segment: segment || null,
      lastActivityDate: lastActivityDate || null,
      totalRevenue: totalRevenue || 0,
      supportTickets: supportTickets || 0,
    });

    // Get created customer
    const [customer] = await getCustomers(user.id);

    // Create embedding and store in Pinecone (async, don't wait)
    createCustomerEmbedding(customer)
      .then((embedding) => {
        return upsertCustomerVector(customerId, user.id, embedding, {
          name: customer.name,
          email: customer.email || undefined,
          segment: customer.segment || undefined,
        });
      })
      .catch((error) => {
        console.error("Failed to create customer vector:", error);
      });

    // Return success
    return NextResponse.json(
      {
        success: true,
        message: "Customer created successfully",
        customer,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create customer error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create customer" },
      { status: error.message === "Unauthorized - Please sign in" ? 401 : 500 }
    );
  }
}