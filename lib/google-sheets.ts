import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

const SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
];

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

export async function fetchKanbanData() {
    const doc = await getGoogleSheet();

    // Sheet 1: Tasks
    const tasksSheet = doc.sheetsByTitle['Tasks'] || await doc.addSheet({ title: 'Tasks', headerValues: ['id', 'title', 'priority', 'deadline', 'dueDate', 'progress', 'isCompleted', 'isCancelled', 'isArchived', 'description'] });
    const taskRows = await tasksSheet.getRows();

    const tasks: Record<string, any> = {};
    taskRows.forEach(row => {
        const id = row.get('id');
        tasks[id] = {
            id,
            title: row.get('title'),
            priority: row.get('priority'),
            deadline: row.get('deadline'),
            dueDate: row.get('dueDate'),
            progress: parseInt(row.get('progress') || '0'),
            isCompleted: row.get('isCompleted') === 'TRUE',
            isCancelled: row.get('isCancelled') === 'TRUE',
            isArchived: row.get('isArchived') === 'TRUE',
            description: row.get('description'),
        };
    });

    // Sheet 2: Columns
    const columnsSheet = doc.sheetsByTitle['Columns'] || await doc.addSheet({ title: 'Columns', headerValues: ['id', 'title', 'taskIds'] });
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
    const configSheet = doc.sheetsByTitle['Config'] || await doc.addSheet({ title: 'Config', headerValues: ['key', 'value'] });
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

    // Ensure all columns in columnOrder exist in columns object
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
    const notificationsSheet = doc.sheetsByTitle['Notifications'] || await doc.addSheet({ title: 'Notifications', headerValues: ['id', 'type', 'title', 'description', 'time', 'timestamp', 'read', 'userName', 'userAvatar', 'userInitials'] });
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
}

export async function saveKanbanData(data: { tasks: any, columns: any, columnOrder: string[], notifications?: any[] }) {
    try {
        const doc = await getGoogleSheet();

        // Update Tasks
        const tasksSheet = doc.sheetsByTitle['Tasks'] || await doc.addSheet({ title: 'Tasks', headerValues: ['id', 'title', 'priority', 'deadline', 'dueDate', 'progress', 'isCompleted', 'isCancelled', 'isArchived', 'description'] });
        await tasksSheet.clearRows();
        const taskRows = Object.values(data.tasks).map((task: any) => ({
            id: task.id,
            title: task.title,
            priority: task.priority,
            deadline: task.deadline,
            dueDate: task.dueDate,
            progress: task.progress,
            isCompleted: task.isCompleted ? 'TRUE' : 'FALSE',
            isCancelled: task.isCancelled ? 'TRUE' : 'FALSE',
            isArchived: task.isArchived ? 'TRUE' : 'FALSE',
            description: task.description || '',
        }));
        if (taskRows.length > 0) {
            await tasksSheet.addRows(taskRows);
        }

        // Update Columns
        const columnsSheet = doc.sheetsByTitle['Columns'] || await doc.addSheet({ title: 'Columns', headerValues: ['id', 'title', 'taskIds'] });
        await columnsSheet.clearRows();
        const columnRows = Object.values(data.columns).map((col: any) => ({
            id: col.id,
            title: col.title,
            taskIds: JSON.stringify(col.taskIds),
        }));
        if (columnRows.length > 0) {
            await columnsSheet.addRows(columnRows);
        }

        // Update Config
        const configSheet = doc.sheetsByTitle['Config'] || await doc.addSheet({ title: 'Config', headerValues: ['key', 'value'] });
        await configSheet.clearRows();
        await configSheet.addRows([
            { key: 'columnOrder', value: JSON.stringify(data.columnOrder) }
        ]);

        // Update Notifications
        if (data.notifications) {
            const notificationsSheet = doc.sheetsByTitle['Notifications'] || await doc.addSheet({ title: 'Notifications', headerValues: ['id', 'type', 'title', 'description', 'time', 'timestamp', 'read', 'userName', 'userAvatar', 'userInitials'] });
            await notificationsSheet.clearRows();
            const notificationRows = data.notifications.map((n: any) => ({
                id: n.id,
                type: n.type,
                title: n.title,
                description: n.description,
                time: n.time,
                timestamp: n.timestamp,
                read: n.read ? 'TRUE' : 'FALSE',
                userName: n.user?.name || '',
                userAvatar: n.user?.avatar || '',
                userInitials: n.user?.initials || '',
            }));
            if (notificationRows.length > 0) {
                await notificationsSheet.addRows(notificationRows);
            }
        }
    } catch (error: any) {
        console.error('Failed to save to Google Sheets:', error.message);
        throw error;
    }
}
