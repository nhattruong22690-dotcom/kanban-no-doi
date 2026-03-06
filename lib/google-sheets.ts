import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
];

const TASK_HEADERS = ['id', 'title', 'priority', 'deadline', 'dueDate', 'createdAt', 'progress', 'isCompleted', 'isCancelled', 'isArchived', 'description', 'checklist'];
const COLUMN_HEADERS = ['id', 'title', 'taskIds'];
const CONFIG_HEADERS = ['key', 'value'];
const NOTIFICATION_HEADERS = ['id', 'type', 'title', 'description', 'time', 'timestamp', 'read', 'userName', 'userAvatar', 'userInitials'];

// ─────────────────────────────────────────────────────
// Kết nối Google Sheets
// ─────────────────────────────────────────────────────
export async function getGoogleSheet() {
    if (!SPREADSHEET_ID || !GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
        throw new Error('Google Sheets environment variables are not set');
    }

    const jwt = new JWT({
        email: GOOGLE_CLIENT_EMAIL,
        key: GOOGLE_PRIVATE_KEY,
        scopes: SCOPES,
    });

    const doc = new GoogleSpreadsheet(SPREADSHEET_ID, jwt);
    await doc.loadInfo();
    return doc;
}

// ─────────────────────────────────────────────────────
// Helper: Lấy hoặc tạo sheet
// ─────────────────────────────────────────────────────
async function getOrCreateSheet(doc: GoogleSpreadsheet, title: string, headerValues: string[]) {
    return doc.sheetsByTitle[title] || await doc.addSheet({ title, headerValues });
}

// ─────────────────────────────────────────────────────
// Helper: Serialize task object thành row data
// ─────────────────────────────────────────────────────
function taskToRow(task: any) {
    if (!task || !task.id) throw new Error('Task data is invalid or missing ID');
    return {
        id: task.id,
        title: task.title || '',
        priority: task.priority || '',
        deadline: task.deadline || '',
        dueDate: task.dueDate || '',
        createdAt: task.createdAt || new Date().toISOString(),
        progress: task.progress ?? 0,
        isCompleted: task.isCompleted ? 'TRUE' : 'FALSE',
        isCancelled: task.isCancelled ? 'TRUE' : 'FALSE',
        isArchived: task.isArchived ? 'TRUE' : 'FALSE',
        description: task.description || '',
        checklist: JSON.stringify(task.checklist || []),
    };
}

// ─────────────────────────────────────────────────────
// READ: Đọc toàn bộ dữ liệu (giữ nguyên, đọc không gây hại)
// ─────────────────────────────────────────────────────
export async function fetchKanbanData() {
    try {
        const doc = await getGoogleSheet();

        // Sheet 1: Tasks
        const tasksSheet = await getOrCreateSheet(doc, 'Tasks', TASK_HEADERS);
        const taskRows = await tasksSheet.getRows();

        const tasks: Record<string, any> = {};
        taskRows.forEach(row => {
            const id = row.get('id');
            if (!id) return;

            let parsedChecklist = [];
            try {
                parsedChecklist = JSON.parse(row.get('checklist') || '[]');
            } catch (e) {
                console.error(`Failed to parse checklist for task ${id}`, e);
            }

            tasks[id] = {
                id,
                title: row.get('title'),
                priority: row.get('priority'),
                deadline: row.get('deadline'),
                dueDate: row.get('dueDate'),
                createdAt: row.get('createdAt') || '',
                progress: parseInt(row.get('progress') || '0'),
                isCompleted: row.get('isCompleted') === 'TRUE',
                isCancelled: row.get('isCancelled') === 'TRUE',
                isArchived: row.get('isArchived') === 'TRUE',
                description: row.get('description') || '',
                checklist: parsedChecklist,
            };
        });

        // Sheet 2: Columns
        const columnsSheet = await getOrCreateSheet(doc, 'Columns', COLUMN_HEADERS);
        const columnRows = await columnsSheet.getRows();

        const columns: Record<string, any> = {};
        const defaultColumnData: Record<string, string> = {
            'col-1': 'Sắp ăn hành',
            'col-5': 'Đang ngâm giấm',
            'col-2': 'Đang bị hành',
            'col-3': 'Tu thành chính quả',
            'col-4': 'Nằm thẳng (Bỏ cuộc)'
        };

        columnRows.forEach(row => {
            const id = row.get('id');
            if (id) {
                try {
                    columns[id] = {
                        id,
                        title: row.get('title'),
                        taskIds: JSON.parse(row.get('taskIds') || '[]'),
                    };
                } catch (e) {
                    console.error(`Failed to parse taskIds for column ${id}`, e);
                }
            }
        });

        // Sheet 3: Config (Column Order)
        const configSheet = await getOrCreateSheet(doc, 'Config', CONFIG_HEADERS);
        const configRows = await configSheet.getRows();
        const columnOrderRow = configRows.find(r => r.get('key') === 'columnOrder');
        let columnOrder = ['col-1', 'col-5', 'col-2', 'col-3', 'col-4'];

        if (columnOrderRow) {
            try {
                columnOrder = JSON.parse(columnOrderRow.get('value'));
            } catch (e) {
                console.error('Failed to parse columnOrder config', e);
            }
        }

        // Ensure all columns in columnOrder exist  
        columnOrder.forEach(id => {
            if (!columns[id]) {
                columns[id] = {
                    id,
                    title: defaultColumnData[id] || 'Cột mới',
                    taskIds: []
                };
            }
        });

        // Sheet 4: Notifications
        const notificationsSheet = await getOrCreateSheet(doc, 'Notifications', NOTIFICATION_HEADERS);
        const notificationRows = await notificationsSheet.getRows();

        const notifications = notificationRows.map(row => ({
            id: row.get('id'),
            type: row.get('type'),
            title: row.get('title'),
            description: row.get('description'),
            time: row.get('time'),
            timestamp: row.get('timestamp'),
            read: row.get('read') === 'TRUE',
            user: row.get('userName') ? {
                name: row.get('userName'),
                avatar: row.get('userAvatar'),
                initials: row.get('userInitials'),
            } : undefined,
        }));

        return { tasks, columns, columnOrder, notifications };
    } catch (error: any) {
        console.error('🔴 fetchKanbanData FAILED:', error.message);
        throw error; // Ném lỗi để frontend biết không fetch được → KHÔNG lưu gì cả
    }
}

// ═══════════════════════════════════════════════════════
// WRITE OPERATIONS — Thao tác từng dòng, KHÔNG BAO GIỜ clearRows()
// ═══════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────
// TASK: Thêm mới (Append)
// ─────────────────────────────────────────────────────
export async function appendTask(task: any) {
    try {
        if (!task || !task.id || !task.title) {
            throw new Error('Cannot append task: missing required fields (id, title)');
        }
        const doc = await getGoogleSheet();
        const sheet = await getOrCreateSheet(doc, 'Tasks', TASK_HEADERS);
        await sheet.addRow(taskToRow(task));
        console.log(`✅ Appended task: ${task.id}`);
    } catch (error: any) {
        console.error(`🔴 appendTask FAILED for ${task?.id}:`, error.message);
        throw error;
    }
}

// ─────────────────────────────────────────────────────
// TASK: Cập nhật (Update in-place)
// ─────────────────────────────────────────────────────
export async function updateTask(taskId: string, taskData: any) {
    try {
        if (!taskId || !taskData) {
            throw new Error('Cannot update task: missing taskId or data');
        }
        const doc = await getGoogleSheet();
        const sheet = await getOrCreateSheet(doc, 'Tasks', TASK_HEADERS);
        const rows = await sheet.getRows();
        const targetRow = rows.find(r => r.get('id') === taskId);

        if (!targetRow) {
            // Task not found → it might be new, append instead
            console.warn(`⚠️ Task ${taskId} not found for update, appending instead`);
            await sheet.addRow(taskToRow(taskData));
            return;
        }

        // Update each field in-place
        const rowData = taskToRow(taskData);
        Object.entries(rowData).forEach(([key, value]) => {
            targetRow.set(key, value);
        });
        await targetRow.save();
        console.log(`✅ Updated task: ${taskId}`);
    } catch (error: any) {
        console.error(`🔴 updateTask FAILED for ${taskId}:`, error.message);
        throw error;
    }
}

// ─────────────────────────────────────────────────────
// TASK: Xóa (Delete specific row)
// ─────────────────────────────────────────────────────
export async function deleteTask(taskId: string) {
    try {
        if (!taskId) {
            throw new Error('Cannot delete task: missing taskId');
        }
        const doc = await getGoogleSheet();
        const sheet = await getOrCreateSheet(doc, 'Tasks', TASK_HEADERS);
        const rows = await sheet.getRows();
        const targetRow = rows.find(r => r.get('id') === taskId);

        if (!targetRow) {
            console.warn(`⚠️ Task ${taskId} not found for deletion, skipping`);
            return;
        }

        await targetRow.delete();
        console.log(`✅ Deleted task: ${taskId}`);
    } catch (error: any) {
        console.error(`🔴 deleteTask FAILED for ${taskId}:`, error.message);
        throw error;
    }
}

// ─────────────────────────────────────────────────────
// COLUMN: Cập nhật taskIds trong cột (Update in-place)
// ─────────────────────────────────────────────────────
export async function updateColumnTaskIds(colId: string, newTaskIds: string[]) {
    try {
        if (!colId) {
            throw new Error('Cannot update column: missing colId');
        }
        const doc = await getGoogleSheet();
        const sheet = await getOrCreateSheet(doc, 'Columns', COLUMN_HEADERS);
        const rows = await sheet.getRows();
        const targetRow = rows.find(r => r.get('id') === colId);

        if (!targetRow) {
            console.warn(`⚠️ Column ${colId} not found, creating it`);
            const defaultColumnData: Record<string, string> = {
                'col-1': 'Sắp ăn hành',
                'col-5': 'Đang ngâm giấm',
                'col-2': 'Đang bị hành',
                'col-3': 'Tu thành chính quả',
                'col-4': 'Nằm thẳng (Bỏ cuộc)'
            };
            await sheet.addRow({
                id: colId,
                title: defaultColumnData[colId] || 'Cột mới',
                taskIds: JSON.stringify(newTaskIds),
            });
            return;
        }

        targetRow.set('taskIds', JSON.stringify(newTaskIds));
        await targetRow.save();
        console.log(`✅ Updated column ${colId} taskIds`);
    } catch (error: any) {
        console.error(`🔴 updateColumnTaskIds FAILED for ${colId}:`, error.message);
        throw error;
    }
}

// ─────────────────────────────────────────────────────
// NOTIFICATION: Thêm mới (Append)
// ─────────────────────────────────────────────────────
export async function appendNotification(notification: any) {
    try {
        if (!notification || !notification.id) {
            throw new Error('Cannot append notification: missing id');
        }
        const doc = await getGoogleSheet();
        const sheet = await getOrCreateSheet(doc, 'Notifications', NOTIFICATION_HEADERS);
        await sheet.addRow({
            id: notification.id,
            type: notification.type || 'system',
            title: notification.title || '',
            description: notification.description || '',
            time: notification.time || '',
            timestamp: notification.timestamp || new Date().toISOString(),
            read: notification.read ? 'TRUE' : 'FALSE',
            userName: notification.user?.name || '',
            userAvatar: notification.user?.avatar || '',
            userInitials: notification.user?.initials || '',
        });
        console.log(`✅ Appended notification: ${notification.id}`);
    } catch (error: any) {
        console.error(`🔴 appendNotification FAILED:`, error.message);
        throw error;
    }
}

// ─────────────────────────────────────────────────────
// NOTIFICATION: Cập nhật trạng thái đã đọc (Update in-place)
// ─────────────────────────────────────────────────────
export async function updateNotificationRead(notifId: string, read: boolean) {
    try {
        if (!notifId) {
            throw new Error('Cannot update notification: missing notifId');
        }
        const doc = await getGoogleSheet();
        const sheet = await getOrCreateSheet(doc, 'Notifications', NOTIFICATION_HEADERS);
        const rows = await sheet.getRows();
        const targetRow = rows.find(r => r.get('id') === notifId);

        if (!targetRow) {
            console.warn(`⚠️ Notification ${notifId} not found, skipping`);
            return;
        }

        targetRow.set('read', read ? 'TRUE' : 'FALSE');
        await targetRow.save();
        console.log(`✅ Updated notification ${notifId} read=${read}`);
    } catch (error: any) {
        console.error(`🔴 updateNotificationRead FAILED for ${notifId}:`, error.message);
        throw error;
    }
}

// ─────────────────────────────────────────────────────
// NOTIFICATION: Đánh dấu tất cả đã đọc
// ─────────────────────────────────────────────────────
export async function markAllNotificationsRead() {
    try {
        const doc = await getGoogleSheet();
        const sheet = await getOrCreateSheet(doc, 'Notifications', NOTIFICATION_HEADERS);
        const rows = await sheet.getRows();

        const unreadRows = rows.filter(r => r.get('read') !== 'TRUE');
        for (const row of unreadRows) {
            row.set('read', 'TRUE');
            await row.save();
        }
        console.log(`✅ Marked ${unreadRows.length} notifications as read`);
    } catch (error: any) {
        console.error('🔴 markAllNotificationsRead FAILED:', error.message);
        throw error;
    }
}

// ─────────────────────────────────────────────────────
// NOTIFICATION: Xóa một notification
// ─────────────────────────────────────────────────────
export async function deleteNotification(notifId: string) {
    try {
        if (!notifId) {
            throw new Error('Cannot delete notification: missing notifId');
        }
        const doc = await getGoogleSheet();
        const sheet = await getOrCreateSheet(doc, 'Notifications', NOTIFICATION_HEADERS);
        const rows = await sheet.getRows();
        const targetRow = rows.find(r => r.get('id') === notifId);

        if (!targetRow) {
            console.warn(`⚠️ Notification ${notifId} not found for deletion, skipping`);
            return;
        }

        await targetRow.delete();
        console.log(`✅ Deleted notification: ${notifId}`);
    } catch (error: any) {
        console.error(`🔴 deleteNotification FAILED for ${notifId}:`, error.message);
        throw error;
    }
}
