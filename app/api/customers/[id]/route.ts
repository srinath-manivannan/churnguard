/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================
// SINGLE CUSTOMER API - GET, UPDATE, DELETE
// ============================================
// GET /api/customers/[id] - Get single customer
// PUT /api/customers/[id] - Update customer
// DELETE /api/customers/[id] - Delete customer

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import {
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "@/lib/db/queries";
import { deleteCustomerVector } from "@/lib/ai/pinecone";

// ============================================
// GET - Get single customer by ID
// ============================================
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Get customer from database
    const customer = await getCustomerById(params.id, user.id);

    // Check if customer exists
    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    // Return customer
    return NextResponse.json({
      success: true,
      customer,
    });
  } catch (error: any) {
    console.error("Get customer error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get customer" },
      { status: error.message === "Unauthorized - Please sign in" ? 401 : 500 }
    );
  }
}

// ============================================
// PUT - Update customer
// ============================================
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Parse request body
    const body = await request.json();

    // Update customer in database
    await updateCustomer(params.id, user.id, body);

    // Get updated customer
    const customer = await getCustomerById(params.id, user.id);

    // Return success
    return NextResponse.json({
      success: true,
      message: "Customer updated successfully",
      customer,
    });
  } catch (error: any) {
    console.error("Update customer error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update customer" },
      { status: error.message === "Unauthorized - Please sign in" ? 401 : 500 }
    );
  }
}

// ============================================
// DELETE - Delete customer
// ============================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Require authentication
    const user = await requireAuth();

    // Delete from database
    await deleteCustomer(params.id, user.id);

    // Delete from Pinecone (async, don't wait)
    deleteCustomerVector(user.id, params.id).catch((error) => {
      console.error("Failed to delete customer vector:", error);
    });

    // Return success
    return NextResponse.json({
      success: true,
      message: "Customer deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete customer error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete customer" },
      { status: error.message === "Unauthorized - Please sign in" ? 401 : 500 }
    );
  }
}