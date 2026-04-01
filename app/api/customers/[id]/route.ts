/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import {
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "@/lib/db/queries";
import { deleteCustomerVector } from "@/lib/ai/pinecone";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    const customer = await getCustomerById(params.id, user.id);

    if (!customer) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    const body = await request.json();

    await updateCustomer(params.id, user.id, body);

    const customer = await getCustomerById(params.id, user.id);

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    await deleteCustomer(params.id, user.id);

    deleteCustomerVector(user.id, params.id).catch((error) => {
      console.error("Failed to delete customer vector:", error);
    });

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
