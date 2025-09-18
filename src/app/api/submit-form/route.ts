import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.json();
    console.log(formData);


    return NextResponse.json({
      message: 'Form submitted successfully!',
    });
  } catch (error) {
    console.error('Error submitting form:', error);
    return NextResponse.json({ error: 'Failed to submit form.' }, { status: 500 });
  }
}