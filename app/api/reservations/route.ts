import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

/**
 * Validation schema for reservation payload
 * Using existing database schema with bigint IDs
 */
const reservationSchema = z.object({
  barberId: z.number().int().positive("Barber ID must be a positive integer"),
  serviceId: z.number().int().positive("Service ID must be a positive integer"),
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().min(1, "Customer phone is required"),
  customerEmail: z.string().email("Valid email is required").optional(),
  startTime: z.string().datetime("Start time must be a valid ISO datetime"),
  endTime: z.string().datetime("End time must be a valid ISO datetime"),
  notes: z.string().optional(),
});

type ReservationPayload = z.infer<typeof reservationSchema>;

/**
 * POST /api/reservations
 * Creates a new reservation in the database.
 * 
 * Expected JSON body:
 * {
 *   barberId: number (bigint ID from Barbers table),
 *   serviceId: number (bigint ID from Services table),
 *   customerName: string,
 *   customerPhone: string,
 *   customerEmail?: string,
 *   startTime: string (ISO),
 *   endTime: string (ISO),
 *   notes?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate payload
    const validationResult = reservationSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          ok: false,
          message: "Invalid request data",
          errors: validationResult.error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    const payload: ReservationPayload = validationResult.data;
    const supabase = createSupabaseServerClient();

    // Step 1: Create or find customer in Customer table
    let customerId: number | null = null;

    // Try to parse phone as number (Customer.phone is bigint)
    const phoneNumber = parseInt(payload.customerPhone.replace(/\D/g, ""), 10);
    
    if (isNaN(phoneNumber)) {
      return NextResponse.json(
        {
          ok: false,
          message: "Invalid phone number format",
        },
        { status: 400 }
      );
    }

    // Check if customer already exists by phone
    const { data: existingCustomer, error: customerFindError } = await supabase
      .from("Customer")
      .select("id")
      .eq("phone", phoneNumber)
      .maybeSingle();

    if (customerFindError && customerFindError.code !== "PGRST116") {
      console.error("Error finding customer:", customerFindError);
      return NextResponse.json(
        {
          ok: false,
          message: "Failed to check existing customer",
          error: customerFindError.message,
        },
        { status: 500 }
      );
    }

    if (existingCustomer) {
      // Customer exists, use their ID
      customerId = existingCustomer.id;
    } else {
      // Create new customer
      const { data: newCustomer, error: customerCreateError } = await supabase
        .from("Customer")
        .insert({
          name: payload.customerName,
          phone: phoneNumber,
          email: payload.customerEmail || null,
        })
        .select("id")
        .single();

      if (customerCreateError) {
        console.error("Error creating customer:", customerCreateError);
        
        // Check if it's an RLS policy error
        if (customerCreateError.code === "42501" || customerCreateError.message.includes("policy")) {
          return NextResponse.json(
            {
              ok: false,
              message: "Database permission denied for Customer table.",
              hint: "You may need to add a policy like: CREATE POLICY 'Allow public inserts' ON \"Customer\" FOR INSERT WITH CHECK (true);",
              error: customerCreateError.message,
            },
            { status: 403 }
          );
        }

        return NextResponse.json(
          {
            ok: false,
            message: "Failed to create customer record",
            error: customerCreateError.message,
          },
          { status: 500 }
        );
      }

      customerId = newCustomer.id;
    }

    // Step 2: Insert reservation with customer_id link
    const { data, error } = await supabase
      .from("Reservations")
      .insert({
        barber_id: payload.barberId,
        service_id: payload.serviceId,
        customer_id: customerId,
        customer_name: payload.customerName,
        customer_phone: payload.customerPhone,
        customer_email: payload.customerEmail || null,
        start_time: payload.startTime,
        end_time: payload.endTime,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase error creating reservation:", error);

      // Check if it's an RLS policy error
      if (error.code === "42501" || error.message.includes("policy")) {
        return NextResponse.json(
          {
            ok: false,
            message:
              "Database permission denied. Please create an INSERT policy for the Reservations table that allows public inserts.",
            hint: "You may need to add a policy like: CREATE POLICY 'Allow public inserts' ON \"Reservations\" FOR INSERT WITH CHECK (true);",
            error: error.message,
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          ok: false,
          message: "Failed to create reservation",
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        reservationId: data.id,
        customerId: customerId,
        message: "Reservation created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in POST /api/reservations:", error);

    // Check if it's the missing env vars error
    if (error instanceof Error && error.message.includes("environment variables")) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      );
    }

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { ok: false, message: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { ok: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
