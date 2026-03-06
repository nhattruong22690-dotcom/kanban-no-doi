import { NextResponse } from 'next/server';
import { fetchKanbanData, saveKanbanData } from '@/lib/google-sheets';

export async function GET() {
    try {
        const data = await fetchKanbanData();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching data from Google Sheets:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json();
        await saveKanbanData(data);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error saving data to Google Sheets:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
