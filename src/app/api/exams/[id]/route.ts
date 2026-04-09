import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  return NextResponse.json({ id, data: null });
}

export async function PATCH(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  return NextResponse.json(
    { message: "Not implemented", id },
    { status: 501 },
  );
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  return NextResponse.json(
    { message: "Not implemented", id },
    { status: 501 },
  );
}
