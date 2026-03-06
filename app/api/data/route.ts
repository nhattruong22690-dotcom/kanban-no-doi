import { NextResponse } from 'next/server';
import {
    fetchKanbanData,
    appendTask,
    updateTask,
    deleteTask,
    updateColumnTaskIds,
    appendNotification,
    updateNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
} from '@/lib/google-sheets';

export async function GET() {
    try {
        const data = await fetchKanbanData();

        // 🛡️ Validate fetched data before returning
        if (!data || !data.columns || !data.columnOrder) {
            console.error('🔴 Fetched data is incomplete or corrupted');
            return NextResponse.json({ error: 'Data integrity check failed' }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('🔴 Error fetching data from Google Sheets:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // 🛡️ Validate action field
        if (!body || !body.action) {
            return NextResponse.json(
                { error: 'Missing "action" field. Expected: add_task, update_task, delete_task, move_task, add_notification, mark_notification_read, mark_all_read, delete_notification' },
                { status: 400 }
            );
        }

        const { action, payload } = body;

        switch (action) {
            // ── TASK OPERATIONS ──
            case 'add_task': {
                if (!payload || !payload.task || !payload.columnId) {
                    return NextResponse.json({ error: 'add_task requires payload.task and payload.columnId' }, { status: 400 });
                }
                // 1. Append the task row to Tasks sheet
                await appendTask(payload.task);
                // 2. Update the target column's taskIds
                await updateColumnTaskIds(payload.columnId, payload.columnTaskIds);
                // 3. Optionally append a notification log
                if (payload.notification) {
                    await appendNotification(payload.notification);
                }
                return NextResponse.json({ success: true });
            }

            case 'update_task': {
                if (!payload || !payload.taskId || !payload.task) {
                    return NextResponse.json({ error: 'update_task requires payload.taskId and payload.task' }, { status: 400 });
                }
                await updateTask(payload.taskId, payload.task);
                // If columns changed (task moved between columns), update both columns
                if (payload.fromColId && payload.toColId && payload.fromColTaskIds && payload.toColTaskIds) {
                    await updateColumnTaskIds(payload.fromColId, payload.fromColTaskIds);
                    await updateColumnTaskIds(payload.toColId, payload.toColTaskIds);
                } else if (payload.columnId && payload.columnTaskIds) {
                    // Single column update (e.g., task stays in same column but order changed)
                    await updateColumnTaskIds(payload.columnId, payload.columnTaskIds);
                }
                if (payload.notification) {
                    await appendNotification(payload.notification);
                }
                return NextResponse.json({ success: true });
            }

            case 'delete_task': {
                if (!payload || !payload.taskId) {
                    return NextResponse.json({ error: 'delete_task requires payload.taskId' }, { status: 400 });
                }
                await deleteTask(payload.taskId);
                // Update all affected columns
                if (payload.columnUpdates) {
                    for (const col of payload.columnUpdates) {
                        await updateColumnTaskIds(col.colId, col.taskIds);
                    }
                }
                if (payload.notification) {
                    await appendNotification(payload.notification);
                }
                return NextResponse.json({ success: true });
            }

            case 'move_task': {
                if (!payload || !payload.taskId) {
                    return NextResponse.json({ error: 'move_task requires payload.taskId' }, { status: 400 });
                }
                // Update the task itself (status flags may change)
                if (payload.task) {
                    await updateTask(payload.taskId, payload.task);
                }
                // Update source and destination column taskIds
                if (payload.fromColId && payload.fromColTaskIds) {
                    await updateColumnTaskIds(payload.fromColId, payload.fromColTaskIds);
                }
                if (payload.toColId && payload.toColTaskIds) {
                    await updateColumnTaskIds(payload.toColId, payload.toColTaskIds);
                }
                if (payload.notification) {
                    await appendNotification(payload.notification);
                }
                return NextResponse.json({ success: true });
            }

            case 'reorder_task': {
                // Reorder within same column
                if (!payload || !payload.columnId || !payload.columnTaskIds) {
                    return NextResponse.json({ error: 'reorder_task requires payload.columnId and payload.columnTaskIds' }, { status: 400 });
                }
                await updateColumnTaskIds(payload.columnId, payload.columnTaskIds);
                return NextResponse.json({ success: true });
            }

            // ── NOTIFICATION OPERATIONS ──
            case 'add_notification': {
                if (!payload || !payload.notification) {
                    return NextResponse.json({ error: 'add_notification requires payload.notification' }, { status: 400 });
                }
                await appendNotification(payload.notification);
                return NextResponse.json({ success: true });
            }

            case 'mark_notification_read': {
                if (!payload || !payload.notifId) {
                    return NextResponse.json({ error: 'mark_notification_read requires payload.notifId' }, { status: 400 });
                }
                await updateNotificationRead(payload.notifId, true);
                return NextResponse.json({ success: true });
            }

            case 'mark_all_read': {
                await markAllNotificationsRead();
                return NextResponse.json({ success: true });
            }

            case 'delete_notification': {
                if (!payload || !payload.notifId) {
                    return NextResponse.json({ error: 'delete_notification requires payload.notifId' }, { status: 400 });
                }
                await deleteNotification(payload.notifId);
                return NextResponse.json({ success: true });
            }

            default:
                return NextResponse.json(
                    { error: `Unknown action: "${action}"` },
                    { status: 400 }
                );
        }
    } catch (error: any) {
        console.error('🔴 Error processing action:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
